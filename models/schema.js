const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL).then(()=>{
  console.log("successfully connected to database...");
}).catch(err =>{
  console.log(`there was some error while creating the database::: ${err}`);
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  // credential: [],
});

const ResourceSchema = new mongoose.Schema({
  resourceName:String,
  resourceValue: String,
  resourceSharedWith:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  resourceOwner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
});

const User = mongoose.model("User", UserSchema);
const Resource = mongoose.model("Resource", ResourceSchema);

module.exports = {
  User,
  Resource,
};
