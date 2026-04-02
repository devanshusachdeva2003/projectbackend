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

    // 🔍 Get both users
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ❌ Already following (safe ObjectId check)
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    // ✅ Attach to request (avoid re-query in controller)
    req.currentUser = currentUser;
    req.targetUser = targetUser;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};