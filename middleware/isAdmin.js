const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ 
      message: "Admin access required",
      requireLogout: req.user && req.user.role !== "admin" 
    });
  }
  next();
};

module.exports = isAdmin;
