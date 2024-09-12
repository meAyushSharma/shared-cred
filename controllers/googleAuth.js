require("../utils/passport");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { User } = require("../models/schema");
// const permitAuthorization = require("../utils/permitAuthorization");

module.exports.passportAuthenticate = passport.authenticate("google", {
    successRedirect: "/credential-manager/success",
    failureRedirect: "/credential-manager/failure",
})

module.exports.passportScope = passport.authenticate("google", { scope: ["email", "profile"] })

module.exports.googleAuthSuccess = async (req, res) => {
    if (!req.user) {
      console.log("please redirect!")
      return res.redirect("/failure");
    }
    const username = req.user.email;
    const name = req.user.given_name + (req.user.family_name ? " " + req.user.family_name : "");
    const user = await User.findOne({ username: req.user.email });
    console.log("the user stored in db is in /success ");
    if (!user) {
      User.create({ username, name }).then(async (user) => {
        const userToken = jwt.sign(
          {
            username: username,
            name: name,
          },
          process.env.JWT_SECRET_KEY
        );
        // await permitAuthorization.createPermitUser(username);
        res.cookie("googleToken", userToken, {
          maxAge: 3 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          path: '/',
        });
        return res.redirect(200, "/credential-manager"); // return, not really needed here
      });
    } else {
  
      console.log("/success else statement");
      const userToken = jwt.sign(
        {
          username: username,
          name: name,
        },
        process.env.JWT_SECRET_KEY
      );
      // console.log("this is google token: ", userToken);
      res.cookie("googleToken", userToken, {
        maxAge: 3 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: '/'
      });
      // console.log("googleToken saved in else statement /success");
      return res.redirect("/credential-manager");
    }
}

module.exports.googleAuthFailure = (req, res) => {
    return res.send("failure!!");
}