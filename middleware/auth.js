const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token" });

  if (token.startsWith("Bearer ")) token = token.slice(7).trim();

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_change_this");
    
    // Verify user still exists and role hasn't changed
    const user = await User.findById(verified.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // If role in token differs from current role, reject the token
    if (verified.role !== user.role) {
      return res.status(401).json({ 
        message: "Your role has been changed. Please log in again.",
        requireLogout: true 
      });
    }

    req.user = verified;
    next();
  } catch (err) {
    // If token is expired
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
