const { Resource } = require("../models/schema");
const { User } = require("../models/schema");
const ExpressError = require('../utils/ExpressError');

function createResource(key, value, user) {
  return new Promise((resolve, reject) => {
    Resource.create({
      resourceName: key,
      resourceValue: value,
      resourceOwner: user._id,
    })
      .then(async (resource) => {
        const userOwnedResources = await Resource.find({
          resourceOwner: user._id,
        });
        resolve(userOwnedResources);
      })
      .catch((err) => {
        throw new ExpressError(`the error while creating new resource is::  ${err}`, 500);
      });
  });
}

module.exports.createResource = async (req, res) => {
  try {
    const { key, value } = req.body;
    const user = req.userDetails;
    if (key != "" && value != "") {
      createResource(key, value, user).then((userOwnedResources) => {
        return res.status(200).send(userOwnedResources);
      });
    } else {
      // means request is sent to refresh the documents
      const userOwnedResources = await Resource.find({
        resourceOwner: user._id,
      }).catch((err) => {
        throw new ExpressError(`the error while fetching resources from DB is::  ${err}`, 500);
      });
      return res.status(200).send(userOwnedResources);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new ExpressError("there was some error creating resource", 500);
  }
};

module.exports.deleteResource = async (req, res) => {
  const { resourceId } = req.body;
  Resource.deleteOne({ _id: resourceId })
    .then(() => {
      return res.status(200).json({ msg: "Resource deleted successfully" });
    })
    .catch((err) => {
      throw new ExpressError(`Error found while deleting resource:::  ${err}`, 500);
    });
};

module.exports.addMemberToResource = async (req, res) => {
  const { addedUser, role, resourceId } = req.body;
  if (!addedUser || !role || !resourceId)
    return res.status(200).json({ response: 0 });

  const resource = await Resource.findOne({ _id: resourceId });
  if (!resource) {
    return res.json({
      response: 4,
      msg: "No matching {credential} found for adding {member} ...(*￣０￣)ノ",
    });
  }
  const user = await User.findOne({ username: addedUser });
  if (!user) {
    return res.json({
      response: 3,
      msg: "No {member} found ¯¯|_(ツ)_|¯¯",
    });
  }
  console.log(
    `user._id (member) is: ${user._id} && resource.resourceOwner is: ${resource.resourceOwner}`
  );

  if (user._id.toString() == resource.resourceOwner.toString()) {
    console.log("You are the OWNER");
    return res.status(200).json({ response: 2 });
  }
  // check for role: add, remove others

  if (role == "viewer") {
    console.log("--------------- A REQUEST IS SENT TO VIEWER ---------------");
    if (resource.viewers.includes(user._id)) {
      console.log(
        `user: ${user.username} is ALREADY viewer of: ${resourceId}/${resource.resourceName}`
      );
      return res.status(200).json({ response: 1 });
    } else if (
      resource.editors.includes(user._id) ||
      resource.authors.includes(user._id)
    ) {
      await resource.updateOne({
        $pull: { editors: { $in: [user._id] }, authors: { $in: [user._id] } },
        $push: { viewers: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(
        `user: ${user.username} is now VIEWER of: ${resourceId}/${resource.resourceName} after removing from others`
      );
      return res.status(200).json({ response: 1 });
    } else {
      await resource.updateOne({
        $push: { viewers: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(
        `user: ${user.username} is NOW author of: ${resourceId}/${resource.resourceName}`
      );
      res.status(200).json({ response: 1 });
    }
  } else if (role == "editor") {
    console.log("--------------- A REQUEST IS SENT TO EDITOR ---------------");
    if (resource.editors.includes(user._id)) {
      console.log(
        `user: ${user.username} is ALREADY editor of: ${resourceId}/${resource.resourceName}`
      );
      res.status(200).json({ response: 1 });
    } else if (
      resource.viewers.includes(user._id) ||
      resource.authors.includes(user._id)
    ) {
      await resource.updateOne({
        $pull: { viewers: { $in: [user._id] }, authors: { $in: [user._id] } },
        $push: { editors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(
        `user: ${user.username} is now EDITOR of: ${resourceId}/${resource.resourceName} after removing from others`
      );
      return res.status(200).json({ response: 1 });
    } else {
      await resource.updateOne({
        $push: { editors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(
        `user: ${user.username} is NOW editor of: ${resourceId}/${resource.resourceName}`
      );
      return res.status(200).json({ response: 1 });
    }
  } else if (role == "author") {
    console.log("--------------- A REQUEST IS SENT TO AUTHOR ---------------");
    if (resource.authors.includes(user._id)) {
      console.log(
        `user: ${user.username} is already author of: ${resourceId}/${resource.resourceName}`
      );
      return res.status(200).json({ response: 1 });
    } else if (
      resource.viewers.includes(user._id) ||
      resource.editors.includes(user._id)
    ) {
      await resource.updateOne({
        $pull: { viewers: { $in: [user._id] }, editors: { $in: [user._id] } },
        $push: { authors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(
        `user: ${user.username} is now AUTHOR of: ${resourceId}/${resource.resourceName} after removing from others`
      );
      return res.status(200).json({ response: 1 });
    } else {
      await resource.updateOne({
        $push: { authors: user._id },
        $set: { resourceSharedWith: true },
      });
      resource.save();
      console.log(
        `user: ${user.username} is NOW author of: ${resourceId}/${resource.resourceName}`
      );
      return res.status(200).json({ response: 1 });
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
  try{
  Resource.findOneAndUpdate(
    { _id: resId },
    { resourceName: newKey, resourceValue: newValue },
    { new: true }
  ).then((response) => {
    if (response) {
      return res.status(200).json({ response: 1 });
    }
  });
}catch(error){
  throw new ExpressError(`Error while editing resource is: ${error}`, 500);
}
};
