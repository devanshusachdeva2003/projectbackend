const transporter = require("../config/email");

const sendResetEmail = async (email, resetCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Password Reset Code",
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
            .code-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .reset-code {
              font-size: 36px;
              font-weight: bold;
              color: white;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              margin: 10px 0;
            }
            .code-label {
              color: rgba(255, 255, 255, 0.9);
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
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
            .instructions {
              background-color: #f0f8ff;
              border-left: 4px solid #4CAF50;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #333;
              text-align: left;
              font-size: 14px;
            }
            .instructions li {
              margin: 8px 0;
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
              <h1>🔐 Password Reset Code</h1>
            </div>

            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the code below to reset your password.</p>
            </div>

            <div class="code-box">
              <div class="code-label">Your Reset Code</div>
              <div class="reset-code">${resetCode}</div>
            </div>

            <div class="instructions">
              <strong>📝 How to reset your password:</strong>
              <ol>
                <li>Go to the password reset page</li>
                <li>Enter your email address</li>
                <li>Enter the code above</li>
                <li>Enter your new password</li>
                <li>Click "Reset Password"</li>
              </ol>
            </div>

            <div class="warning">
              ⚠️ <strong>This code will expire in 15 minutes.</strong> If you don't use it within this time, you'll need to request a new code.
            </div>

            <p style="color: #666; font-size: 14px;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>

            <div class="divider"></div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2026 Blog App. All rights reserved.</p>
              <p>Security Tip: Never share this code with anyone.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset code sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send reset email:", error);
    throw error;
  }
};

module.exports = sendResetEmail;
