const { Permit } = require("permitio");
const { Resource } = require("../models/schema");
const { User } = require("../models/schema");
const ExpressError = require('../utils/ExpressError');
const permitAuthorization = require('../utils/permitAuthorization');

function createResource(key, value, user, symmetricKey) {
  return new Promise((resolve, reject) => {
    Resource.create({
      resourceName: key,
      resourceValue: value,
      resourceOwner: user._id,
      symmetricKey: symmetricKey
    })
      .then(async (resource) => {
        const userOwnedResources = await Resource.find({
          resourceOwner: user._id,
        });
        // make permit resource
        await permitAuthorization.createPermitResource(resource._id, resource.resourceName).then(async ()=>{
          // assign user its role
          await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "owner");
        })
    
        resolve(userOwnedResources);
      })
      .catch((err) => {
        throw new ExpressError(`the error while creating new resource is::  ${err}`, 500);
      });
  });
}

module.exports.createResource = async (req, res) => {
  try {
    const { key, value, symmetricKey } = req.body;
    const user = req.userDetails;
    if (key != "" && value != "") {
      createResource(key, value, user, symmetricKey).then((userOwnedResources) => {
        return res.status(200).send({ userOwnedResources, publicKeyFromDBString: user.publicKey, username: user.username });
      });
    } else {
      // means request is sent to refresh the documents
      const userOwnedResources = await Resource.find({
        resourceOwner: user._id,
      }).catch((err) => {
        throw new ExpressError(`the error while fetching resources from DB is::  ${err}`, 500);
      });
      return res.status(200).send({ userOwnedResources, publicKeyFromDBString: user.publicKey, username: user.username });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new ExpressError("there was some error creating resource", 500);
  }
};

module.exports.deleteResource = async (req, res) => {
  const { resourceId } = req.body;
  const check = await permitAuthorization.checkPermission(req.userDetails.username, "delete", resourceId, "cred");
  if(!check.check) return res.status(403).json({
      deleted: false,
      msg: "User not permitted"
  });
  Resource.deleteOne({ _id: resourceId , 
    $or:[
      {resourceOwner: req.userDetails._id },
      // {editors: {$in: [req.userDetails._id]}}, 
      {authors: {$in: [req.userDetails._id]}}
    ]
  })
    .then(async (response) => {
      if(!response.acknowledged){
        return res.status(401).json({
          deleted: false,
          msg: "User not permitted"
        });
      }
      await permitAuthorization.deleteResource(resourceId);
      User.updateMany({},{ $pull: {encryptedSymmetricKeys: { resourceId: resourceId }}})
      .then(result => {
        return res.status(200).json({
          msg: "Resource deleted successfully",
          deleted: true
         });
      }).catch((err) => {
        throw new ExpressError(`Error found while deleting resource:::  ${err}`, 500);
      });
    }).catch((err) => {
        throw new ExpressError(`Error found while deleting resource:::  ${err}`, 500);
      });
};

module.exports.addMemberToResource = async (req, res) => {
  const { addedUser, role, resourceId, stringEncryptedSymmetricKey } = req.body;
  if (!addedUser || !role || !resourceId || !stringEncryptedSymmetricKey) return res.status(200).json({ response: 0 });
  const resource = await Resource.findOne({ _id: resourceId, resourceOwner: req.userDetails._id });
  if (!resource) return res.json({ response: 4, msg: "No matching {credential} found for adding {member} ...(*￣０￣)ノ" });
  
  const user = await User.findOneAndUpdate({ username: addedUser},
    { 
      $addToSet: { 
        encryptedSymmetricKeys: { 
          encryptedSymmetricKey: stringEncryptedSymmetricKey, 
          resourceId: resourceId 
        } 
      } 
    },
    { new: true }
  );

  if (!user) return res.json({ response: 3, msg: "No {member} found ¯¯|_(ツ)_|¯¯" });
  
  console.log(`user._id (member) is: ${user._id} && resource.resourceOwner is: ${resource.resourceOwner}`);

  // if (user._id.toString() == resource.resourceOwner.toString()) {
  //   console.log("You are the OWNER");
  //   return res.status(200).json({ response: 2 });
  // }
  const permitCheck = await permitAuthorization.checkPermission(user.username, "share", resource._id, "cred");
  if(permitCheck.check) return res.status(200).json({ response: 2 });

  // check for role: add, remove others

  if (role == "viewer") {
    console.log("--------------- A REQUEST IS SENT TO VIEWER ---------------");
    if (resource.viewers.includes(user._id)) {
      console.log(`user: ${user.username} is ALREADY viewer of: ${resourceId}/${resource.resourceName}`);
      return res.status(200).json({ response: 1 });
    } else if (resource.editors.includes(user._id) || resource.authors.includes(user._id)) {
      await resource.updateOne({
        $pull: { editors: { $in: [user._id] }, authors: { $in: [user._id] } },
        $push: { viewers: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();

      if(resource.editors.includes(user._id)) await permitAuthorization.unassignPermitRole(user.username, resource._id, "editor");
      if(resource.authors.includes(user._id)) await permitAuthorization.unassignPermitRole(user.username, resource._id, "author");
      
      console.log(`user: ${user.username} is now VIEWER of: ${resourceId}/${resource.resourceName} after removing from others`);
      await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "viewer").then(()=> {
        return res.status(200).json({ response: 1 });
       })
    } else {
      await resource.updateOne({
        $push: { viewers: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(`user: ${user.username} is NOW viewer of: ${resourceId}/${resource.resourceName}`);
      await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "viewer").then(()=> {
        return res.status(200).json({ response: 1 });
       })
    }
  } else if (role == "editor") {
    console.log("--------------- A REQUEST IS SENT TO EDITOR ---------------");
    if (resource.editors.includes(user._id)) {
      console.log(`user: ${user.username} is ALREADY editor of: ${resourceId}/${resource.resourceName}`);
      return res.status(200).json({ response: 1 });
    } else if ( resource.viewers.includes(user._id) || resource.authors.includes(user._id) ) {
      await resource.updateOne({
        $pull: { viewers: { $in: [user._id] }, authors: { $in: [user._id] } },
        $push: { editors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();

      if(resource.viewers.includes(user._id)) await permitAuthorization.unassignPermitRole(user.username, resource._id, "viewer");
      if(resource.authors.includes(user._id)) await permitAuthorization.unassignPermitRole(user.username, resource._id, "author");

      console.log(`user: ${user.username} is now EDITOR of: ${resourceId}/${resource.resourceName} after removing from others`);
      await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "editor").then(()=> {
        return res.status(200).json({ response: 1 });
       })
    } else {
      await resource.updateOne({
        $push: { editors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(`user: ${user.username} is NOW editor of: ${resourceId}/${resource.resourceName}`);
      await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "editor").then(()=> {
        return res.status(200).json({ response: 1 });
       })
    }
  } else if (role == "author") {
    console.log("--------------- A REQUEST IS SENT TO AUTHOR ---------------");
    if (resource.authors.includes(user._id)) {
      console.log(`user: ${user.username} is already author of: ${resourceId}/${resource.resourceName}`);
      return res.status(200).json({ response: 1 });
    } else if ( resource.viewers.includes(user._id) || resource.editors.includes(user._id) ) {
      await resource.updateOne({
        $pull: { viewers: { $in: [user._id] }, editors: { $in: [user._id] } },
        $push: { authors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();

      if(resource.editors.includes(user._id)) await permitAuthorization.unassignPermitRole(user.username, resource._id, "editor");
      if(resource.viewers.includes(user._id)) await permitAuthorization.unassignPermitRole(user.username, resource._id, "viewer");

      console.log(`user: ${user.username} is now AUTHOR of: ${resourceId}/${resource.resourceName} after removing from others`);
      await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "author").then(()=> {
        return res.status(200).json({ response: 1 });
       })
    } else {
      await resource.updateOne({
        $push: { authors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(`user: ${user.username} is NOW author of: ${resourceId}/${resource.resourceName}`);
      await permitAuthorization.createPermitResourceInstanceAndAssignRole(user.username, resource._id, "author").then(()=> {
       return res.status(200).json({ response: 1 });
      })
    }
  } else {
    console.log("Not a Role T_T");
    return res.status(402).json({ response: 0 });
  }
};

module.exports.editResource = async (req, res) => {
  const { newKey, newValue, resId } = req.body;
  if (!newKey || !newValue || !resId) {
    res.status(400).json({
      response: 0,
    });
  }
  const permitResult = await permitAuthorization.checkPermission(req.userDetails.username, "edit", resId, "cred");
  if(!permitResult) return res.status(403).json({ 
    response: 2,
    msg: "Not permitted"
  });
  try{
  Resource.findOneAndUpdate(
    { _id: resId , 
      $or:[
        {resourceOwner: req.userDetails._id },
        {viewers: {$nin: [req.userDetails._id]}}
      ]},
    { resourceName: newKey, resourceValue: newValue },
    { new: true }
  ).then((response) => {
    if (!response) {
      return res.status(200).json({ response: 2 }); // not permitted
    }
    return res.status(200).json({ response: 1 });
  });
}catch(error){
  throw new ExpressError(`Error while editing resource is: ${error}`, 500);
}
};

module.exports.getSymmetricKey = async (req, res) => {
  const resourceId = req.body.resourceId;
  const resource = await Resource.findOne({ _id: resourceId });
  if(!resource) return res.status(401).json({ msg: "resource not found" });
  return res.status(200).json({
    symmetricKeyBase64: resource.symmetricKey
  });
}



// --------------------- shared resources operations -----------------------//

module.exports.showSharedResources = async (req, res) => {
  try {
    const resourcesSharedWithUser = await Resource.find({
      $or: [
        { editors: { $in: [req.userDetails._id] } },
        { authors: { $in: [req.userDetails._id] } },
        { viewers: { $in: [req.userDetails._id] } },
      ],
    }).populate("resourceOwner");

    if (!resourcesSharedWithUser) {
      return res.status(500).json({
        msg: "Error occurred, could not fetch documents",
      });
    }

    const resourcesToSend = { viewer: [], editor: [], author: [] };

    // Create an array of promises
    const promises = resourcesSharedWithUser.map(async (resource) => {
      if (resource.viewers.includes(req.userDetails._id)) {
        const checkViewer = await permitAuthorization.checkPermission( req.userDetails.username, "view", resource._id, "cred" );
        const result = req.userDetails.encryptedSymmetricKeys.find(obj => obj.resourceId.toString() === resource._id.toString() );
        resourcesToSend.viewer.push({
          resourceName: resource.resourceName,
          resourceValue: resource.resourceValue,
          resourceOwner: resource.resourceOwner.username,
          resourceOwnerName: resource.resourceOwner.name,
          _id: resource._id,
          encryptedSymmetricKey: result.encryptedSymmetricKey,
        });
        if (!checkViewer.check) resourcesToSend.viewer.length = 0;
      } else if (resource.editors.includes(req.userDetails._id)) {
        const checkEditor = await permitAuthorization.checkPermission( req.userDetails.username, "edit", resource._id, "cred" );
        const result = req.userDetails.encryptedSymmetricKeys.find(obj => obj.resourceId.toString() === resource._id.toString() );
        resourcesToSend.editor.push({
          resourceName: resource.resourceName,
          resourceValue: resource.resourceValue,
          resourceOwner: resource.resourceOwner.username,
          resourceOwnerName: resource.resourceOwner.name,
          _id: resource._id,
          encryptedSymmetricKey: result.encryptedSymmetricKey,
        });
        if (!checkEditor.check) resourcesToSend.editor.length = 0;
      } else {
        const checkAuthor = await permitAuthorization.checkPermission( req.userDetails.username, "delete", resource._id, "cred" );
        const result = req.userDetails.encryptedSymmetricKeys.find(obj => obj.resourceId.toString() === resource._id.toString() );
        resourcesToSend.author.push({
          resourceName: resource.resourceName,
          resourceValue: resource.resourceValue,
          resourceOwner: resource.resourceOwner.username,
          resourceOwnerName: resource.resourceOwner.name,
          _id: resource._id,
          encryptedSymmetricKey: result.encryptedSymmetricKey,
        });
        if (!checkAuthor.check) resourcesToSend.author.length = 0;
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    console.log("resourcesToSend before res in showSharedResources : ", resourcesToSend);
    return res.status(200).json({ resourcesToSend });
  } catch (error) {
    return res.status(500).json({ msg: "Error occurred, could not fetch documents" });
  }
};



module.exports.showResourceInfo = async (req, res) => {
  const {resId} = req.body;
  Resource.findOne({_id:resId}).populate('viewers').populate('editors').populate('authors').then(async resource =>{
    if(!resource) return res.json({
      msg:"Resource not found (┬┬﹏┬┬)"
    })
    const check = await permitAuthorization.checkPermission(req.userDetails.username, "share", resource._id, "cred");
    if(!check.check) return res.status(401).json({ msg: "unauthorized to view the resource info" });
    // console.log(resource)
    const resourceToSend = { viewers:[], editors:[], authors:[] }
    resource.viewers.forEach(res => {
      resourceToSend.viewers.push({username: res.username})
    })
    resource.editors.forEach(res => {
      resourceToSend.editors.push({username: res.username})
    })
    resource.authors.forEach(res => {
      resourceToSend.authors.push({username: res.username})
    })
    console.log(resourceToSend)
    return res.status(200).json(resourceToSend);
  })
}

module.exports.removeResourcePermission = async (req, res) => {
  const {resId, username, role} = req.body;
  User.findOne({username: username}).then(async user => {
    if(!user) return res.json({ msg: "User not found ━┳━ ━┳━", remove: false });
    
    const check = await permitAuthorization.checkPermission(req.userDetails.username, "share", resId, "cred");
    if(!check.check) return res.status(401).json({ msg: "unauthorized to remove the permissions" });
    // await User.updateMany( {}, { $pull: { encryptedSymmetricKeys: { resourceId: resId } } } );
    await user.updateOne({ $pull: { encryptedSymmetricKeys: { resourceId: resId } } });
    user.save();
    // const actualRole = role.toLowerCase()+'s';
    if(role === "Viewer"){
    Resource.findOneAndUpdate({_id: resId},{ $pull : { viewers: { $in: [user._id]}}}, {new: true})
    .then(async resource => {

      if(!resource) return res.json({ msg: "Credential to remove permission from not found" });

      console.log("this is resource:: ", resource);

      if(!resource.viewers.length && !resource.editors.length && !resource.authors.length) {
        resource.resourceSharedWith = false;
        await resource.save();
      }
      await permitAuthorization.unassignPermitRole(username, resId, "viewer");
      return res.status(200).json({
        msg: "Removed permission successfully （￣︶￣）↗　",
        remove: true
      });
    }).catch(err =>{
      console.log("eror is:: ", err);
      res.json({
        msg: "Problem occured in removing permission ＞︿＜",
        remove: false
      })
    })
  }else if( role === "Author") {
    Resource.findOneAndUpdate({_id: resId},{ $pull : { authors: { $in: [user._id]}}}, {new: true})
    .then(async resource => {
      if(!resource) return res.json({ msg: "Credential to remove permission from not found" });

      console.log("this is resource:: ", resource);
      if(!resource.viewers.length && !resource.editors.length && !resource.authors.length) {
        resource.resourceSharedWith = false;
        await resource.save();
      }
      await permitAuthorization.unassignPermitRole(username, resId, "author");
      return res.status(200).json({
        msg: "Removed permission successfully （￣︶￣）↗　",
        remove: true
      });
    }).catch(err =>{
      console.log("eror is:: ", err);
      res.json({
        msg: "Problem occured in removing permission ＞︿＜",
        remove: false
      })
    })
  } else {
    Resource.findOneAndUpdate({_id: resId},{ $pull : { editors: { $in: [user._id]}}}, {new: true})
    .then(async resource => {
      if(!resource) return res.json({ msg: "Credential to remove permission from not found" });

      console.log("this is resource:: ", resource);
      if(!resource.viewers.length && !resource.editors.length && !resource.authors.length) {
        resource.resourceSharedWith = false;
        await resource.save();
      }
      await permitAuthorization.unassignPermitRole(username, resId, "editor");
      return res.status(200).json({
        msg: "Removed permission successfully （￣︶￣）↗　",
        remove: true
      });
    }).catch(err =>{
      console.log("eror is:: ", err);
      res.json({
        msg: "Problem occured in removing permission ＞︿＜",
        remove: false
      })
    })
  }
  })
}


