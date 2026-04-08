const transporter = require("../config/email");

const sendResetEmail = async (email, resetToken) => {
  // Build the reset link - use FRONTEND_URL from env
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Password Reset Link",
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 500px;
              margin: 50px auto;
              background-color: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .header {
              margin-bottom: 30px;
            }
            .header h1 {
              color: #333;
              margin: 0;
              font-size: 24px;
            }
            .content {
              color: #555;
              line-height: 1.8;
              margin-bottom: 30px;
              text-align: center;
            }
            .button-box {
              display: inline-block;
              margin: 30px 0;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            }
            .reset-button:hover {
              opacity: 0.9;
            }
            .link-box {
              background-color: #f0f8ff;
              border-left: 4px solid #4CAF50;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #333;
              font-size: 12px;
              word-break: break-all;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 12px;
              margin-top: 30px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #ddd, transparent);
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Link</h1>
            </div>

            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to set a new password.</p>
            </div>

            <div class="button-box">
              <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>

            <p style="color: #666; font-size: 14px; margin: 20px 0;">
              Or copy and paste this link in your browser:
            </p>

            <div class="link-box">
              <strong>Link:</strong><br>
              ${resetLink}
            </div>

            <div class="warning">
              ⚠️ <strong>This link will expire in 1 hour.</strong> If you don't use it within this time, you'll need to request a new link.
            </div>

            <p style="color: #666; font-size: 14px;">
              If you didn't request a password reset, please ignore this email and do not click the link. Your password will remain unchanged.
            </p>

            <div class="divider"></div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2026 Blog App. All rights reserved.</p>
              <p>Security Tip: Never share this link with anyone.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset code sent to ${email}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Failed to send reset email to:", email);
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    
    // Provide helpful error messages
    if (error.code === "EDANGEROUS") {
      console.error("⚠️  Gmail rejected the email for security reasons. Check if LESS SECURE APP ACCESS is disabled.");
    } else if (error.code === "EAUTH") {
      console.error("⚠️  Authentication failed. Wrong EMAIL_USER or EMAIL_PASS in .env file.");
    } else if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    
    throw error;
  }
};

module.exports = sendResetEmail;
