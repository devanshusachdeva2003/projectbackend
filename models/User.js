const mongoose = require("mongoose");
const { userConn } = require("../config/db");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,

  // 🔐 SECURITY QUESTION FEATURE
  securityQuestion: {
  type: String,
  required: true,
},

securityAnswer: {
  type: String,
  required: true,
},

  avatar: {
    type: String,
    default: null,
  },

  bio: String,

  role: {
    type: String,
    default: "user",
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ (optional but recommended)
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;