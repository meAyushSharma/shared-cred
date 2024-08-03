const { User } = require("../models/schema");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const {generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse} = require("@simplewebauthn/server");
const { isTokenAndValid } = require("../utils/catchToken");
const ExpressError = require("../utils/ExpressError");

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
  if (!username || !password || !name) {
    console.log("missing fileds in signup");
    return res.redirect("/credential-manager/signup");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username: username, password: hashedPassword, name: name };
  const alreadyExists = await User.findOne({ username: username });

  if (alreadyExists) return res.send("user already exists");

  try {
    User.create(user).then((user) => {
      const token = jwt.sign(
        { username: user.username, password: user.password, name: user.name },
        process.env.JWT_SECRET_KEY
      );
      console.log("user created and signed in successfully");
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