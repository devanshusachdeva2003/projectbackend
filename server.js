// ============== IMPORTS ==============
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// 🔥 ADD THESE
const cron = require("node-cron");
const Blog = require("./models/Blog");

// ============== DATABASE ==============
const mongoose = require("mongoose");

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
  origin: "*",
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
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// ============== 🔥 CRON JOB (AUTO PUBLISH) - Every 5 minutes ==============
let cronJob = null;

const startCronJob = () => {
  cronJob = cron.schedule("*/5 * * * *", async () => {
    try {
      // Check if database is connected
      if (mongoose.connection.readyState !== 1) {
        return;
      }

      const now = new Date();

      const posts = await Blog.find({
        isPublished: false,
        scheduledAt: { $lte: now },
      }).maxTimeMS(5000); // 5 second timeout per query

      if (posts.length > 0) {
        for (let post of posts) {
          post.isPublished = true;
          await post.save();
        }
      }
    } catch (err) {
      console.error("❌ Cron error:", err.message);
    }
  });

  
};

// ============== DATABASE INITIALIZATION ==============
const connectDB = async () => {
  try {
    const mongoOptions = {
      maxPoolSize: 3,
      minPoolSize: 1,
      maxIdleTimeMS: 45000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      family: 4,
    };

    await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    
    // Start cron job only after successful DB connection
    startCronJob();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

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

// Connect to database independent of the `listen` callback
// This is critical for Vercel since it might bypass `app.listen`
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server dynamically running on ${PORT}`);
});

// ============== GRACEFUL SHUTDOWN ==============
process.on("SIGTERM", () => {
  server.close(() => {
    if (cronJob) cronJob.stop();
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    process.exit(0);
  });
});

// Export the Express API so Vercel can run it as a Serverless Function
module.exports = app;