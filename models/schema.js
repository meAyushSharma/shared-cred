const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  credential: [],
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
