const { User, Resource } = require("../models/schema");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const {generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse} = require("@simplewebauthn/server");
const { isTokenAndValid } = require("../utils/catchToken");
const ExpressError = require("../utils/ExpressError");
const permitAuthorization = require('../utils/permitAuthorization');
const cloudinary = require('../utils/cloudinary');

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

module.exports.sendStaticMain = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    return res.sendFile(path.join(__dirname, "../client", "main/main.html"));
  } else return res.redirect("/credential-manager/signup");
};

module.exports.sendStaticSignup = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    res.redirect("/credential-manager");
  } else {
    res.sendFile(path.join(__dirname, "../client", "signup/signup.html"));
  }
};

module.exports.registerUser = async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    return res.redirect("/credential-manager");
  }
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const publicKey = req.body.publicKey;
  console.log("this is public key:: ", publicKey);
  if (!username || !password || !name) {
    console.log("missing fileds in signup");
    return res.redirect("/credential-manager/signup");
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
      await permitAuthorization.createPermitUser(user.username);
      res.cookie("token", token, {
        maxAge: 3 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
      });
      return res.redirect("/credential-manager");
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
    res.redirect("/credential-manager");
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
    return res.redirect(200, "/credential-manager");
  }
  const username = req.body.username;
  const password = req.body.password;
  console.log("this is username: ", username)
  console.log("this is password: ", password)

  if (!username || !password) {
    console.log(
      "no username or password in /login form {missing fields} : backend"
    );
    return res.redirect(200, "/credential-manager/signup");
  }
  User.findOne({ username: username })
    .then(async (ifUserExist) => {
      if (!ifUserExist) {
        console.log("NO USER FOUND in db /login ");
        return res.redirect("/credential-manager/signup");
      }
      if(!ifUserExist.password){
        console.log("No hashed password in db, must have signed up with google")
        return res.redirect("/credential-manager/signup");
      }
      console.log("this is hashed password: ", ifUserExist.password);
      const isMatch = bcrypt.compareSync(password, ifUserExist.password);
      console.log(`password matching in logging:::: ${isMatch}`);
      if (!isMatch) {
        console.log("WRONG CREDENTIALS in /login");
        return res.redirect("/credential-manager/signup");
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
      return res.redirect(200, "/credential-manager");
    })
    .catch((err) => {
      throw new ExpressError(
        `the error during logging with req.body in /login is:  ${err}`,
        500
      );
    });
};

module.exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("googleToken");
  res.clearCookie("passkeyToken");
  req.logout(function(err) {
    if (err) { console.log('the error dstroying the session is: ', err); }
    console.log("Logging out...");
    res.redirect("/credential-manager/signup");
  });
};


module.exports.uploadCred = async (req, res) => {
  cloudinary.uploader.upload(req.file.path, async (err, result) => {
    if(err) {
      console.log("this is error uploading: ", err);
      return res.status(500).json({
        msg: "error while uploading image",
        success: false
      });
    }
    const name = req.body.name;
    const user = await User.findOneAndUpdate({ _id: req.userDetails._id }, { $push: { credImageURLs: { url: result.secure_url , name: name , publicId: result.public_id }}}, { new:true });
    console.log("this is result: ", result);
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

module.exports.getPublicKey = async (req, res) => {
  const username = req.body.member;
  const resourceId = req.body.resourceId;
  const resource = await Resource.findOne({_id: resourceId});
  const user = await User.findOne({ username: username })
  if(!user || !resource) return res.status(401).json({ msg: "User or Resource not found in getPublicKey" });
  return res.status(200).json({
    publicKeyBase64: user.publicKey,
    symmetricKeybase64: resource.symmetricKey
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