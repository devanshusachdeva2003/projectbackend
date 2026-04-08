const transporter = require("../config/email");

const sendResetEmail = async (email, resetToken) => {
  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Reset Your Password",
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #333;
              margin: 0;
            }
            .content {
              color: #555;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #4CAF50;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #45a049;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 12px;
              margin-top: 30px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .link-text {
              color: #4CAF50;
              word-break: break-all;
              font-size: 12px;
              margin-top: 10px;
              padding: 10px;
              background-color: #f9f9f9;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. If you didn't make this request, please ignore this email and your password will remain unchanged.</p>
              
              <p><strong>Click the button below to reset your password:</strong></p>
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>

              <p>Or copy and paste this link in your browser:</p>
              <div class="link-text">${resetLink}</div>

              <div class="warning">
                ⚠️ <strong>This link will expire in 1 hour.</strong> If you don't reset your password within this time, you'll need to submit a new request.
              </div>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2024 Blog App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send reset email:", error);
    throw error;
  }
};

module.exports = sendResetEmail;
