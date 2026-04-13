const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("../utilis/send"); // ✅ FIXED PATH
const sendResetEmail = require("../utilis/sendResetEmail");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    let { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase();

    // ✅ Separate checks (better UX)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name,
      username,
      email,
      password: hash,
      verificationToken: token,
      isVerified: false,
    });

    // ✅ Try to send email, but allow registration anyway
    try {
      await sendVerificationEmail(email, token);
      user.isVerified = false;
    } catch (emailError) {
      console.error("📧 Email service unavailable:", emailError);
      // Auto-verify user if email service fails (e.g., on Render with Gmail SMTP)
      user.isVerified = true;
      // Attach debug info for development diagnostics only
      if (process.env.NODE_ENV !== "production") {
        user._emailDebug = {
          message: emailError && emailError.message ? emailError.message : String(emailError),
          code: emailError && emailError.code ? emailError.code : undefined,
        };
      }
    }
    
    // Save user regardless of email success/failure
    await user.save();
    
    const baseMessage = user.isVerified
      ? "Registered successfully! You can now login."
      : "Registered successfully. Please verify your email 📧";

    const responsePayload = { message: baseMessage };
    if (process.env.NODE_ENV !== "production" && user._emailDebug) {
      responsePayload.emailDebug = user._emailDebug;
      responsePayload.emailAutoVerified = user.isVerified;
    }

    res.status(201).json(responsePayload);

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Email verification check (optional for development)
    // Uncomment below to enforce email verification
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your email first 📧",
    //   });
    // }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        username: user.username,
      },
      process.env.JWT_SECRET || "your_jwt_secret_change_this",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).html(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>❌ Invalid or Expired Token</h1>
            <p>This verification link is no longer valid.</p>
            <a href="http://localhost:5173/login" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a>
          </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    

    // ✅ Redirect to login page
    res.redirect(`http://localhost:5173/login?verified=true&email=${user.email}`);

  } catch (err) {
    res.status(500).html(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Verification Failed</h1>
          <p>An error occurred while verifying your email.</p>
          <a href="http://localhost:5173/login" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a>
        </body>
      </html>
    `);
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    // Generate 6-digit random code (valid for 15 minutes)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 900000; // 15 minutes

    user.resetToken = resetCode; // Store code in resetToken field
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    

    // Send reset email
    try {
      const info = await sendResetEmail(email, resetCode);
      console.log("📧 Reset email send info:", info && info.response ? info.response : info);
      const payload = {
        message: "Password reset code has been sent to your email 📧",
        code: resetCode // Dev only - remove in production
      };
      if (process.env.NODE_ENV !== "production") payload.sendInfo = info;
      res.json(payload);
    } catch (emailError) {
      console.error("📧 Email Service Unavailable:", emailError);
      // Email service failed but reset code is already saved in database
      // Return success so frontend can prompt for code
      const payload = {
        message: "Password reset code generated. Check your email or contact support. Code: " + resetCode,
        code: resetCode, // Return code for testing/offline use
        emailFailed: true,
      };
      if (process.env.NODE_ENV !== "production") {
        payload.emailError = emailError && emailError.message ? emailError.message : String(emailError);
      }
      res.status(200).json(payload);
    }

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetToken: code,
      resetTokenExpiry: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    

    res.json({ message: "Password has been reset successfully! Please login." });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};