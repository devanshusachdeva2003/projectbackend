const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4-only DNS resolution for Render
dns.setDefaultResultOrder("ipv4first");

// Log environment variables (masked)
console.log("📧 Email Configuration:");
console.log(`  - EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + "***" : "NOT SET"}`);
console.log(`  - EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);
console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not configured!");
}

// Gmail SMTP configuration - Aggressive IPv4-only for Render
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // TLS port
  secure: false, // Use STARTTLS (not SSL)
  requireTLS: true,
  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Must be Gmail App Password (16 chars)
  },

  // ⚠️  CRITICAL SETTINGS FOR RENDER
  // Force IPv4 only - Render blocks IPv6
  family: 4,
  
  // Socket connection settings
  connectionUrl: undefined,
  connectionTimeout: 15000, // 15 seconds
  socketTimeout: 15000,
  
  // DNS resolution
  dnsOptions: {
    "family": 4, // IPv4 only
  },
  
  // Connection pool
  pool: {
    maxConnections: 1,
    maxMessages: 5,
    rateDelta: 1000,
    rateLimit: 5,
  },
  
  // TLS/SSL settings
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  
  // Logging
  logger: true,
  debug: process.env.NODE_ENV === "development",
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter FAILED verification:");
    console.error("   Error:", error.message);
    console.error("   Code:", error.code);
    
    if (error.code === "ENETUNREACH") {
      console.error("   📌 ENETUNREACH = Network unreachable");
      console.error("   ⚠️  Render is blocking IPv6 connections to Gmail SMTP");
      console.error("   Solution: Ensure family: 4 is set (IPv4 only)");
    } else if (error.code === "EAUTH" || error.message.includes("Invalid login")) {
      console.error("   ❌ Authentication failed - Check Gmail App Password");
      console.error("   💡 Make sure you're using a 16-character Google App Password");
    } else if (error.code === "ETIMEDOUT") {
      console.error("   ⏱️  Connection timeout - Try different port or email service");
    }
  } else {
    console.log("✅ Email transporter verified and ready!");
  }
});

module.exports = transporter;