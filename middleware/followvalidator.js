// middleware/followValidation.js

const User = require("../models/User");

exports.validateFollow = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    // ❌ Prevent self-follow
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    // 🔍 Check target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔍 Check current user exists
    const currentUser = await User.findById(currentUserId);

    // ❌ Already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    // attach users for controller (optimization 🔥)
    req.currentUser = currentUser;
    req.targetUser = targetUser;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};