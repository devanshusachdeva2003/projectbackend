require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("🧪 Testing Email Configuration...\n");

// Check environment variables
console.log("📋 Environment Variables:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Set" : "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing");
console.log("");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Email credentials are missing in .env file!");
  console.error("Please add EMAIL_USER and EMAIL_PASS to backend/.env\n");
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test connection
console.log("🔌 Testing Email Transporter Connection...\n");

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Transporter verification failed!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("");

    // Helpful troubleshooting
    if (error.message.includes("Invalid login")) {
      console.log("💡 SOLUTION:");
      console.log("   1. You're using a personal Gmail account");
      console.log("   2. Go to https://myaccount.google.com/apppasswords");
      console.log("   3. Create an 'App Password' for 'Mail' and 'Windows Computer'");
      console.log("   4. Copy the 16-character password to EMAIL_PASS in .env");
      console.log("   5. Make sure 2FA (Two-Factor Authentication) is enabled on Gmail\n");
    } else if (error.message.includes("connect")) {
      console.log("💡 SOLUTION: Check your internet connection\n");
    }

    process.exit(1);
  } else {
    console.log("✅ Email transporter is properly configured!");
    console.log("");

    // Send test email
    const testEmail = process.env.EMAIL_USER;
    console.log(`📧 Sending test email to: ${testEmail}\n`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: "🧪 Email Configuration Test",
      html: `
        <html>
          <body style="font-family: Arial; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
              <h2 style="color: #4CAF50; text-align: center;">✅ Email Configuration Test Successful!</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                This is a test email to verify that your email configuration is working correctly.
              </p>
              <p style="color: #666; font-size: 14px;">
                <strong>Timestamp:</strong> ${new Date().toLocaleString()}
              </p>
              <hr style="border: none; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you received this email, your email configuration is working perfectly! 🎉
              </p>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Failed to send test email!");
        console.error("Error:", error.message);
        process.exit(1);
      } else {
        console.log("✅ Test email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("");
        console.log("🎉 Your email configuration is working correctly!");
        console.log("You can now use the forgot password feature!\n");
        process.exit(0);
      }
    });
  }
});
