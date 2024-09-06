const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/session");

const userScema = mongoose.Schema({
  username : String,
  name : String,
  email : String,
  password : String,
  bio: String,
  profileImage : String,
  posts : [{type: mongoose.Schema.Types.ObjectId, ref:"post"}]
});

userScema.plugin(plm)
module.exports = mongoose.model("user", userScema);