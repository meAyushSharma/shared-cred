require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/schema");

async function userAuth(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded) {
      const { username, password, name } = decoded;
      const ifUserExist = await User.findOne({
        username: username,
        password: password,
      });
      if (ifUserExist) {
        req.userDetail = {
          username: username,
          password: password,
        };
        console.log("user is logging through token");
        next();
      } else {
        res.status(411).json({
          msg: "Invalid inputs",
        });
      }
    } else {
      res.send("there was some problem in token");
    }
  } else {
    const username = req.body.username;
    const password = req.body.password;
    const ifUserExist = await User.findOne({
      username: username,
    });
    if (!ifUserExist) {
      res.status(411).json({
        msg: "Invalid inputs",
      });
    }
    const isMatch = await bcrypt.compareSync(password, ifUserExist.password);
    if (!isMatch) {
      res.status(411).json({
        msg: "Invalid inputs",
      });
    }
    req.userDetail = {
      username: username,
      passowrd: password,
    };
    console.log("user is logging through body inputs!");
    next();
  }
}

module.exports = { userAuth };
