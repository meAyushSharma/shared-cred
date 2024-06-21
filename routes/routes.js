require("dotenv").config();
const { Router } = require("express");
const jwt = require("jsonwebtoken");
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
  res.redirect("/credential-manager/");
});


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

  Resource.create({
    resourceName: key,
    resourceValue: value,
    resourceOwner: user._id,
  })
    .then(async (resource) => {
      console.log(`newly created resource is::: ${resource}`);
      const userOwnedResources = await Resource.find({
        resourceOwner: user._id,
      });
      res.status(200).send(userOwnedResources);
    })
    .catch((err) => {
      throw new Error(`the error while creating new resource is::  ${err}`);
    });
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

module.exports = { router };
