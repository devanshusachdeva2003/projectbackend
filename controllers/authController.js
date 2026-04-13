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
    // Handle duplicate key (race condition) for better UX
    if (err && (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000))) {
      const value = err.keyValue && (err.keyValue.email || err.keyValue.username) ? (err.keyValue.email || err.keyValue.username) : undefined;
      const field = err.keyValue && Object.keys(err.keyValue)[0] ? Object.keys(err.keyValue)[0] : 'field';
      return res.status(400).json({ message: `${field} already registered${value ? `: ${value}` : ''}` });
    }
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

    // Generate secure token (valid for 15 minutes)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store hash and expiry on user
    user.resetTokenHash = tokenHash;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Build frontend reset link.
    // Preference order: explicit FRONTEND_URL env, BASE_URL env, request origin, request host, then localhost fallback.
    const frontendBase =
      process.env.FRONTEND_URL ||
      process.env.BASE_URL ||
      req.get("origin") ||
      `${req.protocol}://${req.get("host")}` ||
      "http://localhost:5173";

    const resetLink = `${frontendBase.replace(/\/$/,"")}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send reset link
    try {
      const sendResetLink = require("../utilis/sendResetLink");
      const info = await sendResetLink(email, resetLink);
      console.log("📧 Reset link send info:", info && info.response ? info.response : info);
      const payload = { message: "Password reset link has been emailed. Check your inbox." };
      // If operator enabled, return resetLink in response (temporary, for debugging)
      if (process.env.RETURN_RESET_LINK === "true") {
        payload.resetLink = resetLink;
        payload.sendInfo = info;
      } else if (process.env.NODE_ENV !== "production") {
        payload.debug = { resetLink, sendInfo: info };
      }
      return res.json(payload);
    } catch (emailError) {
      console.error("📧 Email Service Unavailable:", emailError);
      // Email failed — keep token stored so user can use link if you can surface it in dev
      const payload = {
        message: "Password reset requested. Email delivery failed — contact support.",
        emailFailed: true,
      };
      // Optionally return the reset link for production debugging
      if (process.env.RETURN_RESET_LINK === "true") {
        payload.resetLink = resetLink;
        payload.error = emailError && emailError.message ? emailError.message : String(emailError);
      } else if (process.env.NODE_ENV !== "production") {
        payload.debug = { resetLink, error: emailError && emailError.message ? emailError.message : String(emailError) };
      }
      return res.status(200).json(payload);
    }

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetTokenHash: tokenHash,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetTokenHash = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password has been reset successfully! Please login." });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};