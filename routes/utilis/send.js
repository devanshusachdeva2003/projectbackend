const transporter = require("../config/email");

const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Email",
    html: `<h2>Verify Your Email</h2>
           <a href="${link}">Click to verify</a>`,
  });
};

module.exports = sendVerificationEmail;