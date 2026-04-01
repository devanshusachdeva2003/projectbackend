const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      securityQuestion,
      securityAnswer,
    } = req.body;

    const exist = await User.findOne({ $or: [{ email }, { username }] });
    if (exist) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      password: hash,
      securityQuestion,
      securityAnswer,
    });

    await user.save();

    res.json({ message: "Registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};
// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid" });

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

// ================= GET SECURITY QUESTION =================
exports.getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.securityQuestion) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      question: user.securityQuestion,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching question" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 compare answer
    const isMatch = await bcrypt.compare(
      answer.toLowerCase(),
      user.securityAnswer
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect answer" });
    }

    // 🔐 update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
};