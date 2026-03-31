const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {
  validateFollow,
} = require("../middleware/followvalidator");

const {
  validateUnfollow,
} = require("../middleware/unfollowvalidator");

const userController = require("../controllers/userController");

const router = express.Router();

// 🔐 ADMIN
router.get("/", auth, isAdmin, userController.getAllUsers);

// 🔥 FOLLOW SYSTEM
router.post(
  "/follow/:id",
  auth,
  validateFollow,
  userController.followUser
);

router.post(
  "/unfollow/:id",
  auth,
  validateUnfollow,
  userController.unfollowUser
);

module.exports = router;