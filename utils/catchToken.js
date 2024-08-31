const { User } = require("../models/schema");
const jwt = require("jsonwebtoken");
// const cookieParser = require('cookie-parser');

module.exports.isTokenAndValid = async function (req, res) {
  const token = req.cookies.token;
  const googleToken = req.cookies.googleToken;
  const passkeyToken = req.cookies.passkeyToken;
  if (token == undefined && googleToken == undefined && passkeyToken == undefined) {
    return null;
  }
  if(token){
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const { username, password, name } = decoded;
  const userExist = await User.findOne({
    username: username,
    password: password,
  });
  if (!userExist) {
    return null;
  }
  return userExist;
}
if(googleToken){
  const decoded = jwt.verify(googleToken, process.env.JWT_SECRET_KEY);
  const {username, name} = decoded;
  const userExist = await User.findOne({username: username});
  if(!userExist){
    return null;
  }
  return userExist;
}
if(passkeyToken){
  const decoded = jwt.verify(passkeyToken, process.env.JWT_SECRET_KEY);
  const {username, name} = decoded;
  const userExist = await User.findOne({username: username});
  if(!userExist){
    return null;
  }
  return userExist;
}
};
