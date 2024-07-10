require("dotenv").config();
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { permit } = require("permitio");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const express = require("express");
const { User } = require("../models/schema");
const { Resource } = require("../models/schema");
const { userAuth } = require("../middleware/userAuth");
const { isTokenAndValid } = require("../utils/catchToken");
const router = Router();

router.use(express.static(path.join(__dirname, "../client")));
router.use(express.static(path.join(__dirname, "../client", "main")));
router.use(express.static(path.join(__dirname, "../client", "signup")));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.get("/", async (req, res) => {
  // send in static files
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    res.sendFile(path.join(__dirname, "../client", "main/main.html"));
  } else {
    res.redirect("/credential-manager/signup");
  }
});

router.get("/signup", async (req, res) => {
  const response = await isTokenAndValid(req, res);
  if (response != null) {
    res.redirect("/credential-manager");
  } else {
    res.sendFile(path.join(__dirname, "../client", "signup/signup.html"));
  }
});

router.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  if (!username || !password || !name) {
    console.log("missing fileds in signup");
    res.redirect("/credential-manager/signup");
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      username: username,
      password: hashedPassword,
      name: name,
    };
    const alreadyExists = await User.findOne({
      username: username,
    });

    if (alreadyExists) {
      res.send("user already exists");
    } else {
      try {
        User.create(user).then((user) => {
          console.log("after creation");
          const token = jwt.sign(
            {
              username: user.username,
              password: user.password,
              name: user.name,
            },
            process.env.JWT_SECRET_KEY
          );
          console.log("user created and signed in successfully");
          res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
          });
          res.redirect("/credential-manager");
        });
      } catch (err) {
        console.log("the error in creating user is: " + err);
        res.status(500).send(`this is the error while creating user : ${err}`);
      }
    }
  }
});

router.post("/login", userAuth, (req, res) => {
  console.log("user logged in successfully!");
  res.redirect("/credential-manager");
});

function createResource(key, value, user) {
  return new Promise((resolve, reject) => {
    Resource.create({
      resourceName: key,
      resourceValue: value,
      resourceOwner: user._id,
    })
      .then(async (resource) => {
        // console.log(`newly created resource is::: ${resource}`);
        const userOwnedResources = await Resource.find({
          resourceOwner: user._id,
        });
        // console.log(userOwnedResources);
        resolve(userOwnedResources);
      })
      .catch((err) => {
        throw new Error(`the error while creating new resource is::  ${err}`);
      });
  });
}

router.post("/create-resource", userAuth, async (req, res) => {
  const { key, value } = req.body;
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findOne({
    username: decoded.username,
  });
  if (!user) {
    res.status(400).send("NOT AUTHENTICATED");
  }
  if (key != "" && value != "") {
    // console.log("createResource fun is triggered");
    createResource(key, value, user).then((userOwnedResources) => {
      // console.log("this is userOwnedResources: ", userOwnedResources);
      res.status(200).send(userOwnedResources);
    });
  } else {
    // console.log("simply showing creds");
    const userOwnedResources = await Resource.find({
      resourceOwner: user._id,
    }).catch((err) => {
      throw new Error(
        `the error while fetching resources from DB is::  ${err}`
      );
    });
    res.status(200).send(userOwnedResources);
  }
});

router.post("/delete-resource", userAuth, async (req, res) => {
  const { resourceId } = req.body;
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findOne({
    username: decoded.username,
  });
  if (!user) {
    res.status(400).send("NOT AUTHENTICATED");
  }
  Resource.deleteOne({
    _id: resourceId,
  })
    .then(() => {
      res.status(200).json({
        msg: "Resource deleted successfully",
      });
    })
    .catch((err) => {
      throw new Error(`Error found while deleting resource:::  ${err}`);
    });
});

router.post("/add-user", userAuth, async (req, res) => {
  const { addedUser, role, resourceId } = req.body;
  if (!addedUser || !role || !resourceId) {
    res.status(200).json({
      response: 0,
    });
    return;
  }
  const resource = await Resource.findOne({ _id: resourceId });
  if (!resource) {
    res.json({
      response:4,
      msg:"No matching resource found for adding user"
    });
    return;
  }
  const user = await User.findOne({ username: addedUser });
  if (!user) {
    res.json({
      response:3,
      msg:"no user found"
    });
    return;
  }
  console.log(
    `user._id (member) is: ${JSON.stringify(
      user._id
    )} && resource.resourceOwner is: ${JSON.stringify(resource.resourceOwner)}`
  );

  if (user._id.toString() == resource.resourceOwner.toString()) {
    console.log("You are the OWNER");
    res.status(200).json({
      response: 2,
    });
  } else {
    // check for role: add, remove others
    if (role == "viewer") {
      console.log(
        "--------------- A REQUEST IS SENT TO VIEWER ---------------"
      );
      if (resource.viewers.includes(user._id)) {
        // resource.resourceSharedWith = true;
        // resource.save();
        console.log(
          `user: ${user.username} is ALREADY viewer of: ${resourceId}/${resource.resourceName}`
        );
        res.status(200).json({
          response: 1,
        });
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
        res.status(200).json({
          response: 1,
        });
      } else {
        await resource.updateOne({
          $push: { viewers: user._id },
          $set: { resourceSharedWith: true },
        });
        resource.save();
        console.log(
          `user: ${user.username} is NOW author of: ${resourceId}/${resource.resourceName}`
        );
        res.status(200).json({
          response: 1,
        });
      }
    } else if (role == "editor") {
      console.log(
        "--------------- A REQUEST IS SENT TO EDITOR ---------------"
      );
      if (resource.editors.includes(user._id)) {
        console.log(
          `user: ${user.username} is ALREADY editor of: ${resourceId}/${resource.resourceName}`
        );
        res.status(200).json({
          response: 1,
        });
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
        res.status(200).json({
          response: 1,
        });
      } else {
        await resource.updateOne({
          $push: { editors: user._id },
          $set: { resourceSharedWith: true },
        });
        resource.save();
        console.log(
          `user: ${user.username} is NOW editor of: ${resourceId}/${resource.resourceName}`
        );
        res.status(200).json({
          response: 1,
        });
      }
    } else if (role == "author") {
      console.log(
        "--------------- A REQUEST IS SENT TO AUTHOR ---------------"
      );
      if (resource.authors.includes(user._id)) {
        console.log(
          `user: ${user.username} is already author of: ${resourceId}/${resource.resourceName}`
        );
        res.status(200).json({
          response: 1,
        });
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
        res.status(200).json({
          response: 1,
        });
      } else {
        await resource.updateOne({
          $push: { authors: user._id },
          $set: { resourceSharedWith: true },
        });
        resource.save();
        console.log(
          `user: ${user.username} is NOW author of: ${resourceId}/${resource.resourceName}`
        );
        res.status(200).json({
          response: 1,
        });
      }
    } else {
      console.log("added user not saved");
      res.status(402).json({
        response: 0,
      });
    }
  }
});

router.post("/edit-resource", userAuth, async (req, res) => {
  const { newKey, newValue, resId } = req.body;
  // console.log(newKey, newValue, resId);
  if (!newKey || !newValue || !resId) {
    res.status(200).json({
      response: 0,
    });
  }
  Resource.findOneAndUpdate(
    { _id: resId },
    { resourceName: newKey, resourceValue: newValue },
    { new: true }
  ).then((res) => {
    if (res){
      res.status(200).json({
        response: 1,
      });
    }
  });
});

module.exports = { router };
