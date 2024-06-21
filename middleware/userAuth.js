require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/schema");
const { isTokenAndValid } = require("../utils/catchToken");

async function userAuth(req, res, next) {
  const response = await isTokenAndValid(req, res);
  if (response == null) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      console.log("no username or password");
      res.redirect("/credential-manager/signup");
    } else {
      User.findOne({
        username: username,
      })
        .then(async (ifUserExist) => {
          if (!ifUserExist) {
            res.status(411).json({
              msg: "NOT USER FOUND",
            });
          }
          const isMatch = bcrypt.compareSync(password, ifUserExist.password);
          if (!isMatch) {
            res.status(411).json({
              msg: "WRONG CREDENTIALS",
            });
          }
          console.log("user is logging through body inputs!");
          next();
        })
        .catch((err) => {
          throw new Error(
            `the error during userAuth req.body is :::::::: ${err}`
          );
        });
    }
  } else {
    next();
  }
}

module.exports = { userAuth };
