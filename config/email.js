const nodemailer = require("nodemailer");
require("dotenv").config();

// Simple, easy-to-configure SMTP transporter.
// Configure via env vars: SMTP_HOST, SMTP_PORT, SMTP_SECURE, EMAIL_USER, EMAIL_PASS
const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = parseInt(process.env.SMTP_PORT || (process.env.SMTP_SECURE === "true" ? "465" : "587"));
const secure = process.env.SMTP_SECURE === "true" || port === 465;
console.log(process.env.EMAIL_PASS)
console.log(process.env.EMAIL_USER)
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
  },
  // Reasonable defaults; override with env if needed
  connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || "20000"),
  greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT || "20000"),
  socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT || "20000"),
  family: 4,
});

// Lightweight verification log
transporter.verify((error) => {
  if (error) {
    console.error("SMTP verify failed:", error && error.message ? error.message : error);
  } else {
    console.log("SMTP transporter ready");
  }
});

module.exports = transporter;
