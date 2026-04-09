const nodemailer = require("nodemailer");

// Log environment variables (masked)
console.log("📧 Email Configuration:");
console.log(`  - EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + "***" : "NOT SET"}`);
console.log(`  - EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not configured!");
}

// Gmail SMTP configuration - Optimized for Render (IPv4 only)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // TLS port (not 465)
  secure: false, // Use STARTTLS
  requireTLS: true,
  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password, not regular password
  },

  // Render-specific settings
  family: 4, // Force IPv4 only (Render blocks IPv6)
  connectionTimeout: 10000,
  socketTimeout: 10000,
  maxConnections: 1,
  maxMessages: 5,
  rateDelta: 2000,
  rateLimit: 3,
  
  // TLS settings
  tls: {
    rejectUnauthorized: false, // Required for some hosting
    minVersion: "TLSv1.2",
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    console.error("⚠️  Troubleshooting tips:");
    console.error("   1. Ensure EMAIL_USER and EMAIL_PASS are set in .env");
    console.error("   2. For Gmail: Generate an App Password (not regular password)");
    console.error("   3. Enable 2-Step Verification on your Gmail account first");
    console.error("   4. Go to: https://myaccount.google.com/apppasswords");
  } else {
    console.log("✅ Email transporter verified and ready to send emails");
  }
});

module.exports = transporter;