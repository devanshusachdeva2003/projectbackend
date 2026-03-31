const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const { validateFollow } = require("../middleware/followvalidator");
const { validateUnfollow } = require("../middleware/unfollowvalidator");

const userController = require("../controllers/userController");

const router = express.Router();

// ================= ADMIN ROUTES =================
router.get("/", auth, isAdmin, userController.getAllUsers);
router.post("/", auth, isAdmin, userController.createUser);
router.delete("/:id", auth, isAdmin, userController.deleteUser);
router.put("/:id/role", auth, isAdmin, userController.changeUserRole);

// ================= FOLLOW SYSTEM =================
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

// ================= USER PROFILE =================
router.get("/profile/:id", auth, userController.getUserProfile);

module.exports = router;