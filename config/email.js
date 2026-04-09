const nodemailer = require("nodemailer");

// Log environment variables (masked)
console.log("📧 Email Configuration:");
console.log(`  - EMAIL_USER: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + "***" : "NOT SET"}`);
console.log(`  - EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);
console.log(`  - EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || "Not specified (using Gmail)"}`);

let transporter;

// Check if using alternative email service
if (process.env.EMAIL_SERVICE === "brevo") {
  console.log("🔄 Configuring Brevo SMTP...");
  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.BREVO_API_KEY || process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    pool: {
      maxConnections: 1,
      maxMessages: 5,
    },
  });
} else if (process.env.EMAIL_SERVICE === "sendgrid") {
  console.log("🔄 Configuring SendGrid SMTP...");
  transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY || process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    pool: {
      maxConnections: 1,
      maxMessages: 5,
    },
  });
} else {
  // Default to Gmail
  console.log("🔄 Configuring Gmail SMTP...");
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not configured!");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    pool: {
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 2000,
      rateLimit: 3,
    },
  });
}

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    console.error("⚠️  Please check your email configuration:");
    console.error("   - EMAIL_USER and EMAIL_PASS must be set in .env");
    console.error("   - For Gmail: Use App Password (16 characters), not regular password");
    console.error("   - Enable 2-Step Verification on Gmail account first");
    console.error("   - Or use Brevo/SendGrid instead");
  } else {
    console.log("✅ Email transporter verified and ready to send emails");
  }
});

module.exports = transporter;