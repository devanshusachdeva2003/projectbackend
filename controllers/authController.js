const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("../utilis/send");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    let { name, username, email, password } = req.body;

    email = email.toLowerCase();

    const exist = await User.findOne({ $or: [{ email }, { username }] });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
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

    await user.save();

    // 📧 send verification email
    await sendVerificationEmail(email, token);

    res.json({
      message: "Registered successfully. Please verify your email 📧",
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err); // 👈 VERY IMPORTANT
    res.status(500).json({ message: "Registration failed" });
  }
};
// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // 🔥 IMPORTANT FIX
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first 📧",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

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
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};


// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.json({ message: "Email verified successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

