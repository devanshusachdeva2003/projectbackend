const nodemailer = require("nodemailer");

// Log environment variables (masked)
console.log("📧 Email Configuration:");
console.log(`  - EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + "***" : "NOT SET"}`);
console.log(`  - EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);
console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not configured!");
}

// Gmail SMTP configuration - Port 465 with SSL (more reliable for Render)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL port (more reliable than 587 on Render)
  secure: true, // Use SSL
  requireTLS: true,
  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Must be Gmail App Password (16 chars)
  },

  // ⚠️  CRITICAL SETTINGS FOR RENDER
  // IPv4 already forced in server.js via dns.setDefaultResultOrder("ipv4first")
  family: 4,
  
  connectionTimeout: 20000, // 20 seconds
  socketTimeout: 20000,
  
  // Connection pool
  maxConnections: 1,
  maxMessages: 10,
  rateDelta: 500,
  rateLimit: 10,
  
  // TLS/SSL settings
  tls: {
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
      console.error("   📌 ENETUNREACH = Network unreachable (IPv6 issue)");
      console.error("   ⚠️  Render is blocking IPv6 - IPv4 should be forced in server.js");
    } else if (error.code === "EAUTH" || error.message.includes("Invalid login")) {
      console.error("   ❌ Authentication failed - Check Gmail App Password");
      console.error("   💡 Gmail App Password must be exactly 16 characters: xxxx xxxx xxxx xxxx");
    } else if (error.code === "ETIMEDOUT") {
      console.error("   ⏱️  Connection timeout - Gmail SMTP not responding");
    }
  } else {
    console.log("✅ Email transporter verified and ready!");
  }
});

module.exports = transporter;