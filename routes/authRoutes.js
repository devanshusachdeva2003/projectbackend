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
      return res.status(400).send(`
        <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: red;">❌ Invalid or Expired Token</h1>
            <p>This verification link is no longer valid or has expired.</p>
            <a href="http://localhost:5173/login" style="padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Go to Login</a>
          </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);

    // ✅ Redirect to frontend login page
    res.redirect(`http://localhost:5173/login?verified=true&email=${encodeURIComponent(user.email)}`);

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).send(`
      <html>
        <head><title>Verification Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ Verification Failed</h1>
          <p>An error occurred while verifying your email.</p>
          <a href="http://localhost:5173/login" style="padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Go to Login</a>
        </body>
      </html>
    `);
  }
});

// 🔥 FORGOT PASSWORD

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