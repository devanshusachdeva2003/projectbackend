const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("../utilis/send"); // ✅ FIXED PATH

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

    await user.save();

    // 📧 send verification email
    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: "Registered successfully. Please verify your email 📧",
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
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