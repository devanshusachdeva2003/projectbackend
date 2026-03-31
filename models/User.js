const mongoose = require("mongoose");
const { userConn } = require("../config/db");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  avatar: {
    type: String,
    default: null
  },
  bio: String,
  role: { type: String, default: "user" },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);


module.exports = User;
