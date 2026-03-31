const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {
  validateFollow,
} = require("../middleware/followValidation");

const {
  validateUnfollow,
} = require("../middleware/unfollowValidation");

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