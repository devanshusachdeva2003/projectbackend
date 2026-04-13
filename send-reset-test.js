require('dotenv').config();
const sendResetEmail = require('./utilis/sendResetEmail');

const target = process.argv[2] || 'devanshusachdeva2003@gmail.com';

(async () => {
  try {
    console.log(`Sending reset email to: ${target}`);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const info = await sendResetEmail(target, code);
    console.log('Send result:', info);
  } catch (err) {
    console.error('Send failed:', err && err.message ? err.message : err);
    if (err && err.code) console.error('Error code:', err.code);
    if (err && err.response) console.error('SMTP response:', err.response);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
