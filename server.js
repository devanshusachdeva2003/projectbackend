// ============== IMPORTS ==============
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// 🔥 ADD THESE
const cron = require("node-cron");
const Blog = require("./models/Blog");

// ============== ROUTES ==============
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ============== MIDDLEWARE ==============
const auth = require("./middleware/auth");

// ============== EXPRESS SETUP ==============
const app = express();

// ============== CORS CONFIGURATION ==============
app.use(cors({
  origin: true,
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

// ============== HEALTH CHECK ==============
app.use('/health', (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

// ============== ROUTES ==============
app.use("/api", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// ============== 🔥 CRON JOB (AUTO PUBLISH) ==============
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const posts = await Blog.find({
      isPublished: false,
      scheduledAt: { $lte: now },
    });

    for (let post of posts) {
      post.isPublished = true;
      await post.save();
      console.log("✅ Auto Published:", post.title);
    }
  } catch (err) {
    console.log("❌ Cron error:", err.message);
  }
});

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