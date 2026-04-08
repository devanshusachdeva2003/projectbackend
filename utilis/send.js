const transporter = require("../config/email");

const sendVerificationEmail = async (email, token) => {
  try {
    // ✅ Make sure BASE_URL is correct (backend URL)
    const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;

    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`🔗 Verification link: ${link}`);

    const mailOptions = {
      from: `"Blog App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "📧 Verify Your Email - Blog App",
      html: `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50; text-align: center; margin: 0 0 20px 0;">Welcome to Blog App!</h1>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hello,<br><br>
                Thank you for creating an account on our Blog App. To complete your registration and start using all features, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="
                  display: inline-block;
                  padding: 14px 32px;
                  background-color: #4CAF50;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  font-size: 16px;
                  cursor: pointer;
                ">Verify Email Address</a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link in your browser:<br>
                <code style="background-color: #f0f0f0; padding: 8px; border-radius: 4px; word-break: break-all;">${link}</code>
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                If you did not create this account, please ignore this email.<br>
                This link will expire in 24 hours.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent successfully!");
    console.log("📬 Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    console.error("Error Code:", error.code);
    
    // Provide helpful error messages
    if (error.code === "EDANGEROUS") {
      console.error("⚠️  Gmail rejected the email for security reasons. Check your Gmail settings.");
    } else if (error.code === "EAUTH") {
      console.error("⚠️  Authentication failed. Wrong EMAIL_USER or EMAIL_PASS in .env file.");
    } else if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    
    throw error;
  }
};

module.exports = sendVerificationEmail;