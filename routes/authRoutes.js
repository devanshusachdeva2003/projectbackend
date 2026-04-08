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

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// ================= TEST EMAIL =================
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const transporter = require("../config/email");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ Test Email from Blog App",
      html: `
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
              <h1 style="color: #4CAF50;">✅ Test Email Success!</h1>
              <p>Your email configuration is working correctly!</p>
              <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
              <p><strong>To:</strong> ${email}</p>
              <p>You can now use the forgot password feature.</p>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Test Email Error:", err);
        return res.status(500).json({ 
          message: "Failed to send test email",
          error: err.message 
        });
      }
      console.log("✅ Test email sent:", info.response);
      res.json({ 
        message: "✅ Test email sent successfully! Check your inbox.",
        info: info.response 
      });
    });
  } catch (err) {
    console.error("Test Email Error:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
});

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