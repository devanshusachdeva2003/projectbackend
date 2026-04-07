const transporter = require("../config/email");

const sendVerificationEmail = async (email, token) => {
  try {
    // ✅ Make sure BASE_URL is correct (backend URL)
    const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;

    const mailOptions = {
      from: `"Blog App" <${process.env.EMAIL_USER}>`, // better format
      to: email,
      subject: "Verify Your Email 📧",
      html: `
        <h2>Email Verification</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${link}" style="
          display:inline-block;
          padding:10px 20px;
          background-color:#4CAF50;
          color:white;
          text-decoration:none;
          border-radius:5px;
        ">Verify Email</a>
        <p>If you did not create this account, ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Verification email sent to:", email);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error; // important for debugging
  }
};

module.exports = sendVerificationEmail;