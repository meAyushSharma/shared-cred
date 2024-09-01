// require("dotenv").config();
const { isTokenAndValid } = require("../utils/catchToken");
const ExpressError = require('../utils/ExpressError');

async function userAuth(req, res, next) {
  const response = await isTokenAndValid(req, res);
  if (response == null) {
    return res.redirect('/signup', 401);
    // throw new ExpressError("User is not Authenticated", 400);
  } else {
    req.userDetails = response;
    next();
  }
}

module.exports = { userAuth };
