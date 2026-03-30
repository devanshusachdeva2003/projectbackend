const express = require("express");
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.get("/", auth, notificationController.getNotifications);
router.get("/unread-count", auth, notificationController.getUnreadCount);
router.put("/mark-all-read", auth, notificationController.markAllAsRead);
router.put("/:id/read", auth, notificationController.markAsRead);
router.delete("/:id", auth, notificationController.deleteNotification);
router.delete("/", auth, notificationController.deleteAllNotifications);

module.exports = router;
