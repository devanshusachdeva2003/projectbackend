// middleware/unfollowValidation.js

const User = require("../models/User");

exports.validateUnfollow = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ❌ Not following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    req.currentUser = currentUser;
    req.targetUser = targetUser;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};