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
            // res.status(411).json({
            //   msg: "NO USER FOUND",
            // });
            console.log("NO USER FOUND");
            res.redirect("/credential-manager/signup");
          } else {
            const isMatch = bcrypt.compareSync(password, ifUserExist.password);
            console.log(`isMatch is ::::::: ${isMatch}`);
            if (!isMatch) {
              // res.status(411).json({
              //   msg: "WRONG CREDENTIALS",
              // });
              console.log("WRONG CREDENTIALS");
              res.redirect("/credential-manager/signup");
            } else {
              console.log("user is logging through body inputs!");
              const token = jwt.sign(
                {
                  username: ifUserExist.username,
                  password: ifUserExist.password,
                  name: ifUserExist.name,
                },
                process.env.JWT_SECRET_KEY
              );
              console.log("user logged and token created/stored successfully");
              res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
              });
              next();
            }
          }
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
