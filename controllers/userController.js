const { User, Resource } = require("../models/schema");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const {generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse} = require("@simplewebauthn/server");
const { isTokenAndValid } = require("../utils/catchToken");
const ExpressError = require("../utils/ExpressError");
// const permitAuthorization = require('../utils/permitAuthorization');
const cloudinary = require('../utils/cloudinary');
const cloudinaryAPI = require('cloudinary').v2;
const transporter = require('../utils/nodemailer');


if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

module.exports.sendStaticMain = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    return res.sendFile(path.join(__dirname, "../client", "main/main.html"));
  } else return res.redirect("/signup");
};

module.exports.sendStaticSignup = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "../client", "signup/signup.html"));
  }
};

module.exports.registerUser = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    return res.redirect("/");
  }
  const agreeTnc = req.body.agreeTnc;
  const username = req.body.username.toLowerCase().trim();
  const password = req.body.password;
  const name = req.body.name.trim();
  const publicKey = req.body.publicKey;
  if (!username || !password || !name || !publicKey) {
    console.log("missing fields in signup");
    return res.status(400).send("Missing required fields");
  }

  if (agreeTnc !== true) {
    console.log("T&C not accepted");
    return res.status(400).send("Consent required");
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username: username, password: hashedPassword, name: name, publicKey: publicKey };
  const alreadyExists = await User.findOne({ username: username });

  if (alreadyExists) return res.send("user already exists");

  try {
    User.create(user).then(async (user) => {
      const token = jwt.sign(
        { username: user.username, password: user.password, name: user.name },
        process.env.JWT_SECRET_KEY
      );
      console.log("user created and signed in successfully");
      // await permitAuthorization.createPermitUser(user.username);
      res.cookie("token", token, {
        maxAge: 3 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      });
      return res.redirect("/");
    });
  } catch (err) {
    console.log("the error in creating user is: " + err);
    throw new ExpressError(
      `this is the error while creating user : ${err}`,
      500
    );
  }
};


module.exports.sendStaticLogin = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    res.redirect("/");
  } else {
    const filePath = path.join(__dirname, "../client", "login/login.html");
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status || 500).send({
          error: {
            status: err.status,
            message: err.message,
          },
        });
      }
    });
  }
};

module.exports.loginUser = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    console.log("user logged in successfully! ");
    return res.redirect(200, "/");
  }
  const username = req.body.username;
  const password = req.body.password;
  console.log("this is username: ", username)
  console.log("this is password: ", password)

  if (!username || !password) {
    console.log("no username or password in /login form {missing fields} : backend");
    return res.redirect(200, "/signup");
  }
  User.findOne({ username: username })
    .then(async (ifUserExist) => {
      if (!ifUserExist) {
        console.log("NO USER FOUND in db /login ");
        return res.redirect("/signup");
      }
      if(!ifUserExist.password){
        console.log("No hashed password in db, must have signed up with google")
        return res.redirect("/signup");
      }
      console.log("this is hashed password: ", ifUserExist.password);
      const isMatch = bcrypt.compareSync(password, ifUserExist.password);
      console.log(`password matching in logging:::: ${isMatch}`);
      if (!isMatch) {
        console.log("WRONG CREDENTIALS in /login");
        return res.redirect("/signup");
      }
      console.log("user is logging through body inputs!");
      const token = jwt.sign(
        {
          username: ifUserExist.username,
          password: ifUserExist.password,
          name: ifUserExist.name,
        },
        process.env.JWT_SECRET_KEY
      );
      res.cookie("token", token, {
        maxAge: 3 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      });
      console.log("user logged and token created/stored successfully");
      return res.redirect(200, "/");
    })
    .catch((err) => {
      throw new ExpressError(`the error during logging with req.body in /login is:  ${err}`, 500);
    });
};

module.exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("googleToken");
  res.clearCookie("passkeyToken");
  req.logout(function(err) {
    if (err) { console.log('the error dstroying the session is: ', err); }
    console.log("Logging out...");
    res.redirect("/signup");
  });
};

module.exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  if(!newPassword) return res.status(401).json({ msg: "No password, error", success: false });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate({ _id: req.userDetails._id }, { password: hashedPassword }, { new: true });
  if(!(user.password == hashedPassword)) return res.status(401).json({ msg: "Reset password failed", success: false});
  return res.status(200).json({msg: "Reset password successfully", success: true});
}

module.exports.verifyAndSendCode = async (req, res) => {
  const {username} = req.body;
  const user = await User.findOne({username: username});
  if(!user) return res.status(301).json({ msg: "User not found", success:false });
  if(username != user.username) return res.status(301).json({ msg: "User not found", success:false });
  const code = Math.floor(Math.random()*10000000);
  user.code.forgotCode = code;
  user.code.timeCreatedAt = new Date();
  await user.save();
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL_USER,  
    to: username,
    subject: 'Forgot password code', 
    text: `Hello! This is the code for forgot password, code: ${code}`,
    html: `Hello! <b>${user.name}</b>, we hope this finds you well. <br> The code is: ${code} <br> This code is valid only for 10 minutes.`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      return res.status(400).json({ msg: "Error sending code", success: false });
    }
    console.log('Email sent successfully:', info.response);
    return res.status(200).json({ msg: "Code sent successfully", success: true });
  });
}

module.exports.forgotPasswordReset = async (req, res) => {
  const { newPass, enterCode, username } = req.body;
  const user = await User.findOne({username: username});
  if(!user) return res.status(400).json({msg:"User not found", success:false});
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  console.log(user.code.timeCreatedAt);
  const savedDate = new Date(user.code.timeCreatedAt.toString());
  const savedDateInMilliSec = savedDate.getTime();
  try{
    if(savedDateInMilliSec >= tenMinutesAgo && enterCode == user.code.forgotCode){
      console.log("conditions met for updating passford after forgetting ....");
      const hashedPassword = await bcrypt.hash(newPass, 10);
      await User.updateOne({ username: username }, { password: hashedPassword, $unset: {"code.forgotCode": "", "code.timeCreatedAt": 1} });
    }
  } catch(err){
    console.log("the error during updating password after forgetting is: ", err);
    return res.status(500).json({msg:"Some Error occured", success:false});
  }
  return res.status(200).json({msg:"Password updated successfully", success:true});
}


module.exports.uploadCred = async (req, res) => {
  cloudinary.uploader.upload(req.file.path, async (err, result) => {
    if(err) {
      console.log("this is error uploading: ", err);
      return res.status(500).json({
        msg: "error while uploading image on cloud",
        success: false
      });
    }
    const name = req.body.name;
    const user = await User.findOneAndUpdate({ _id: req.userDetails._id }, { $push: { credImageURLs: { url: result.secure_url , name: name , publicId: result.public_id }}}, { new:true });
    console.log("this is result.secure_url = success : ", result.secure_url);
    return res.status(200).json({
      msg: "successfully uploaded",
      success: true,
      imageData: user.credImageURLs
    })
  })
}

module.exports.getImages = async (req, res) => {
  return res.status(200).json({
    imagesArray: req.userDetails.credImageURLs,
    userId: req.userDetails._id
  });
}

module.exports.deleteImage = async (req, res) => {
  const {userId, imageURL} = req.body;
  const user = await User.findOne({_id: req.userDetails._id});
  const publicId = user.credImageURLs.find(obj => obj.url === imageURL).publicId;
  await cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
    if (error) {
      console.error("error deleting image from cloudinary: ", error);
      return res.status(500).json({
        msg: "Error deleting image from cloudinary",
        success: false
      })
    } else {
      console.log(`Image deleted: ${publicId}`);
    }
  });
  await user.updateOne({ $pull: {credImageURLs : { url: imageURL }}});
  await user.save();
  return res.status(200).json({
    msg: "Image Credential deleted successfully (*￣3￣)╭",
    success: true
  })
}

module.exports.sendDataForDownload = async (req, res) => {
  let downloadableData = {};
  downloadableData.credImageURLs = req.userDetails.credImageURLs;
  downloadableData.resources = [];
  const resources = await Resource.find({resourceOwner: req.userDetails._id}).populate('viewers').populate('editors').populate('authors');
  if(!resources) return res.status(401).json({msg: "Credentials not found (┬┬﹏┬┬)", success: false});
  for(let resource of resources){
    let viewers = [];
    let editors = [];
    let authors = [];
    resource.viewers.forEach( viewer => viewers.push(viewer.username) );
    resource.editors.forEach( editor => editors.push(editor.username) );
    resource.authors.forEach( author => authors.push(author.username) );
    downloadableData.resources.push({
      resourceName:resource.resourceName,
      resourceValue: resource.resourceValue, 
      resourceSymmetricKey: resource.symmetricKey,
      resourceViewers: viewers, 
      resourceEditors: editors, 
      resourceAuthors: authors
    });
  }
  return res.status(200).json({ downloadableData, success: true })
}

module.exports.sendForgotPassword = async (req, res) => {
  return res.render('forgotPass');
}

module.exports.deleteAccount = async (req, res) => {
  const deletedUser = await User.findOne({_id: req.userDetails._id});
  if(!deletedUser) return res.status(500).json({ msg: "Error finding User", success: false })
  let public_ids = [];
  for(let credURL of deletedUser.credImageURLs) public_ids.push(credURL.publicId);
  if(public_ids.length != 0){
    const check = await deleteMultipleImages(public_ids);
    if(!check) return res.status(500).json({ msg: "Error in deleting image credentials", success: false });
  }
  // const resourcesForPermit = await Resource.find({resourceOwner: req.userDetails._id});
  // delete permit resources
  // for(let resource of resourcesForPermit){
  //   await permitAuthorization.deleteResource(resource._id);
  // }
  const resources = await Resource.deleteMany({resourceOwner: req.userDetails._id});
  if(!resources) return res.status(500).json({ msg: "Error in deleting credentials", success: false });
  const resourcesAssociated = await Resource.updateMany(
    {
      $or: [
        { viewers: req.userDetails._id },
        { editors: req.userDetails._id },
        { authors: req.userDetails._id }
      ]
    },
    {
      $pull: {
        viewers: req.userDetails._id,
        editors: req.userDetails._id,
        authors: req.userDetails._id
      }
    }
  );
  await deletedUser.deleteOne();
  // await permitAuthorization.deleteUser(req.userDetails.username);
  if(!resourcesAssociated) return res.status(500).json({ msg: "Error in deleting shared with info", success: false });
  res.clearCookie("token");
  res.clearCookie("googleToken");
  res.clearCookie("passkeyToken");
  req.logout(function(err) {
    if (err) console.log('the error dstroying the session is: ', err);
    console.log("Cleared cookies and killed session");
  });
  return res.status(200).json({ msg: "Deleted Account successfully", success: true });
}

const deleteMultipleImages = async (public_ids) => {
 try {
    const result = await cloudinaryAPI.api.delete_resources(public_ids, { invalidate: true });
    console.log('Images deleted:', result);
    return true;
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    return false;
  }
}

module.exports.getPublicKey = async (req, res) => {
  const username = req.body.member;
  const resourceId = req.body.resourceId;
  const resource = await Resource.findOne({_id: resourceId});
  const user = await User.findOne({ username: username })
  if(!user || !resource) return res.status(401).json({ msg: "User or Resource not found in getPublicKey", success: false });
  return res.status(200).json({
    publicKeyBase64: user.publicKey,
    symmetricKeybase64: resource.symmetricKey,
    success: true
  });
}

module.exports.getEncryptedSymmetricKey = async (req, res) => {
  const resourceId = req.body.resourceId;
  const symmetricKeyObj = req.userDetails.encryptedSymmetricKeys.find(obj => obj.resourceId.toString() === resourceId);
  if(!symmetricKeyObj) return res.status(401).json({ msg: "symmetric key not found" });
  return res.status(200).json({
    symmetricKeyBase64: symmetricKeyObj.encryptedSymmetricKey
  });
}

module.exports.checkPublicKey = async (req, res) => { return res.status(200).json({ publicKey: req.userDetails.publicKey }) }

module.exports.setPublicKey = async (req, res) => { 
  const publicKey = req.body.publicKey;
  if(!publicKey) return res.status(401).json({ msg: "public key empty", success: false})
  const user = await User.findOneAndUpdate({ _id: req.userDetails._id }, { publicKey: publicKey }, { new: true });
  if(user.publicKey == "") return res.status(401).json({ msg: "public key not updated/set", success: false });
  return res.status(200).json({ msg: "Updated/set public key", success: true });
}
