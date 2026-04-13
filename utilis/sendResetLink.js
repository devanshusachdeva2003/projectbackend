const transporter = require("../config/email");

// Using SMTP transporter only (Gmail). No SendGrid fallback.

const sendResetLink = async (email, link) => {
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:8px;">
          <h2 style="color:#333">Password reset request</h2>
          <p style="color:#555">Click the button below to reset your password. This link expires in 15 minutes.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
          </div>
          <p style="color:#999; font-size:12px;">Or paste this link into your browser:</p>
          <p style="word-break:break-all; font-size:12px">${link}</p>
          <hr style="margin-top:20px;border:none;border-top:1px solid #eee" />
          <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
        </div>
      </body>
    </html>
  `;

  // First try SMTP transporter
  const mailOptions = {
    from: `"Blog App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Password Reset",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("❌ SMTP send failed:", error && error.message ? error.message : String(error));
    // Only Gmail/SMTP is supported in this deployment. Surface the SMTP error.
    throw error;
  }
};

module.exports = sendResetLink;
