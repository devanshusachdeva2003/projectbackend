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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = userConn.model("User", userSchema);

module.exports = User;
