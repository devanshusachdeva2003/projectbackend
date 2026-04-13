const nodemailer = require("nodemailer");

// Explicit Gmail SMTP configuration with better logging for diagnostics
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  // Use STARTTLS on port 587 (secure:false + requireTLS:true)
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Allow self-signed / corporate proxies; keep false in production if possible
    rejectUnauthorized: false,
    // Enforce TLS upgrade for STARTTLS
    // Note: nodemailer will upgrade the connection when server supports STARTTLS
  },
  requireTLS: true,
  logger: true,
  debug: true,
  // Timeouts and IPv4 preference to avoid some hosting platform issues
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
  family: 4,
});

// Verify transporter and print detailed info on success/failure
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email verification failed:", error && error.message ? error.message : error);
    if (error && error.code) console.error("Error code:", error.code);
    if (error && error.response) console.error("SMTP response:", error.response);
  } else {
    console.log("✅ SMTP transporter is ready to send messages");
  }
});

module.exports = transporter;
