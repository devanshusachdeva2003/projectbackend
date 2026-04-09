const nodemailer = require("nodemailer");

console.log("📧 Email Configuration: Gmail SMTP");
console.log(`  - EMAIL_USER: ${process.env.EMAIL_USER ? "✅ Set" : "❌ Missing"}`);
console.log(`  - EMAIL_PASS: ${process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing"}`);

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
    console.log("✅ Email transporter ready!");
  }
});

module.exports = transporter;
