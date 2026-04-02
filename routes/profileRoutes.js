const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const profileController = require("../controllers/profileController");

const router = express.Router();

// 👤 PROFILE
router.get("/", auth, profileController.getCurrentUser);
router.put("/", auth, upload.single("avatar"), profileController.updateProfile);
router.put("/change-password", auth, profileController.changePassword);

// 👇 ADD THESE ROUTES
router.post("/follow/:id", auth, profileController.followUser);
router.post("/unfollow/:id", auth, profileController.unfollowUser);

module.exports = router;