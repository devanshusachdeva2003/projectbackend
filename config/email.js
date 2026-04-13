const nodemailer = require("nodemailer");


// Gmail SMTP - Simple Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email verification failed:", error.message);
    } else {
  }
});

module.exports = transporter;
