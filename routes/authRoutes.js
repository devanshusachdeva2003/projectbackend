const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
