const mongoose = require("mongoose");
const { userConn } = require("../config/db");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,

  // � EMAIL VERIFICATION
  verificationToken: {
    type: String,
  },

  isVerified: {
    type: Boolean,
    default: false,
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

// ✅ unique email
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;