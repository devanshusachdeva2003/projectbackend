const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add these options to improve reliability
  pool: {
    maxConnections: 5,
    maxMessages: 100,
  },
  rateDelta: 1000,
  rateLimit: 5,
  secure: true,
  requireTLS: true,
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
    console.error("⚠️  Please check your EMAIL_USER and EMAIL_PASS in .env file");
  } else {
    console.log("✅ Email transporter is ready to send emails");
  }
});

module.exports = transporter;