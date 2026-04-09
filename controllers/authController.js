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

    // ✅ Try to send email BEFORE saving user
    try {
      await sendVerificationEmail(email, token);
      console.log(`✅ Verification email sent to ${email}`);
      
      // Save user only after email is sent successfully
      await user.save();
      
      res.status(201).json({
        message: "Registered successfully. Please verify your email 📧",
      });
    } catch (emailError) {
      console.error("📧 Failed to send verification email:", emailError.message);
      
      // Don't save user if email fails
      return res.status(500).json({ 
        message: "Failed to send verification email. Please check your email configuration or try again later.",
        error: emailError.message 
      });
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};
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
    console.log("LOGIN ERROR:", err);
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

    console.log(`✅ Email verified for user: ${user.email}`);

    // ✅ Redirect to login page
    res.redirect(`http://localhost:5173/login?verified=true&email=${user.email}`);

  } catch (err) {
    console.log("VERIFY ERROR:", err);
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

    console.log(`🔐 Reset Code Generated for ${email}: ${resetCode}`); // Debug log

    // Send reset email
    try {
      await sendResetEmail(email, resetCode);
      res.json({
        message: "Password reset code has been sent to your email 📧",
      });
    } catch (emailError) {
      console.error("📧 Email Error Details:", emailError.message);
      console.error("📧 Stack:", emailError.stack);
      // If email fails, clear the reset code
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      
      // Check if it's a Gmail authentication error
      if (emailError.message.includes("Invalid login") || emailError.message.includes("Bad credentials")) {
        return res.status(500).json({ 
          message: "Email configuration error: Invalid credentials. Please contact admin.",
          details: emailError.message 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to send reset email",
        details: emailError.message 
      });
    }

  } catch (err) {
    console.log("FORGOT PASSWORD ERROR:", err);
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

    console.log(`✅ Password reset successfully for ${email}`); // Debug log

    res.json({ message: "Password has been reset successfully! Please login." });

  } catch (err) {
    console.log("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};