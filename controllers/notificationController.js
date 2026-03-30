const Notification = require("../models/Notification");
const User = require("../models/User");

// GET ALL NOTIFICATIONS FOR USER
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .populate("sender", "name username avatar")
      .populate("blog", "title _id")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// GET UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

// MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// MARK SINGLE AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { read: true });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndDelete(id);

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// DELETE ALL NOTIFICATIONS
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ user: userId });

    res.json({ message: "All notifications deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete notifications" });
  }
};
