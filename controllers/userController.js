const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// CREATE USER (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, username, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username: username || name.toLowerCase().replace(/\s+/g, ""),
      role: role || "user",
      avatar: "",
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// CHANGE USER ROLE
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If changing the current user's role, include logout flag
    const isCurrentUser = req.user.id === req.params.id;
    const response = {
      message: "Role updated",
      user,
      requireLogout: isCurrentUser,
    };

    if (isCurrentUser) {
      response.message = "Role updated. Please log in again to continue.";
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "Role update failed" });
  }
};
