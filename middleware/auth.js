const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token" });

  if (token.startsWith("Bearer ")) token = token.slice(7).trim();

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_change_this");
    req.user = verified;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
