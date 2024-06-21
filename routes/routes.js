require("dotenv").config();
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { User } = require("../models/schema");
const { userAuth } = require("../middleware/userAuth");
const router = Router();

router.use(express.static(path.join(__dirname, "../client")));
router.use(express.static(path.join(__dirname, "../client", "main")));

// router.use(
//   cors({
//     origin: "http://localhost:3005/fetch-data",
//     credentials: true,
//   })
// );
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

router.get("/", (req, res) => {
  // send in static files
  res.sendFile(path.join(__dirname, "../client", "main/main.html"));
});

router.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  if (!username || !password || !name) {
    res.json({ msg: "missing fields" });
  } else {
    const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SECRET_KEY);
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
            httpOnly: false,
            secure: true,
            sameSite: "Strict",
          });
          res.status(200).send(`user created successfully : ${user}`);
        });
      } catch (err) {
        console.log("the error in creating user is: " + err);
        res.status(500).send(`this is the error while creating user : ${err}`);
      }
    }
  }
});

router.get("/login", (req, res) => {
  // send in static files
  res.send("hello");
});

router.post("/login", userAuth, (req, res) => {
  console.log("user logged in successfully!");
  res.status(200).json({
    msg: "user logged in successfully",
  });
});

router.post("/fetch-data", async (req, res) => {
  const { key, value, token } = req.body;
  // console.log(`key is: ${key}`);
  // console.log(`value is: ${value}`);
  // console.log(`token is: ${token}`);
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // console.log(`decoded is this::::: ${decoded}`);
  const user = await User.findOneAndUpdate(
    {
      username: decoded.username,
    },
    {
      $push: {
        credential: { key: key, value: value },
      },
    }
  );
  const updatedUser = await User.findOne({
    username: decoded.username,
  });
  // console.log(`user after adding creds is:  ${user}`);
  res.status(200).send(updatedUser);
});

module.exports = { router };
