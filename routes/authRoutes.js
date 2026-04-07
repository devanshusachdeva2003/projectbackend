const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ================= AUTH =================
router.post("/register", authController.register);
router.post("/login", authController.login);

// ================= EMAIL VERIFICATION =================
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    // ✅ Option 1: simple response
    res.send("Email verified successfully ✅");

    // ✅ Option 2 (recommended for frontend apps)
    // res.redirect("http://localhost:5173/login");

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// 🔥 FORGOT PASSWORD
router.post("/get-question", authController.getSecurityQuestion);
router.post("/reset-password", authController.resetPassword);

// ================= CURRENT USER =================
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