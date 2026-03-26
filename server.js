// ============== IMPORTS ==============
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ============== ROUTES ==============
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");

// ============== MIDDLEWARE ==============
const auth = require("./middleware/auth");

// ============== EXPRESS SETUP ==============
const app = express();

// ============== CORS CONFIGURATION ==============
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://blog3-jade.vercel.app/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ============== STATIC FILES ==============
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  maxAge: "1d",
  etag: false
}));

app.use('/health', (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

// ============== AUTH ROUTES ==============
app.use("/api", authRoutes);

// ============== BLOG ROUTES ==============
app.use("/api/blog", blogRoutes);

// ============== PROFILE ROUTES ==============
app.use("/api/profile", profileRoutes);

// ============== ADMIN ROUTES ==============
app.use("/api/users", userRoutes);

// ============== 404 ERROR ==============
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ============== ERROR HANDLING ==============
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Server error" });
});

// ============== SERVER START ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
