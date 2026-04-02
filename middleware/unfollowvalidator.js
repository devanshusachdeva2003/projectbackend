const User = require("../models/User");

exports.validateUnfollow = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    // 🔍 Fetch users
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ❌ Prevent self-unfollow (optional)
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot unfollow yourself",
      });
    }

    // ❌ Check if actually following (safe ObjectId comparison)
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (!isFollowing) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    // ✅ Attach to request
    req.currentUser = currentUser;
    req.targetUser = targetUser;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};