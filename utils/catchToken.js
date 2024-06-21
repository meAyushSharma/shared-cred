const { User } = require("../models/schema");
const jwt = require("jsonwebtoken");

module.exports.isTokenAndValid = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    return null;
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const { username, password, name } = decoded;
  const ifUserExist = await User.findOne({
    username: username,
    password: password,
  });
  if (!ifUserExist) {
    return null;
  }
  return ifUserExist;
};
