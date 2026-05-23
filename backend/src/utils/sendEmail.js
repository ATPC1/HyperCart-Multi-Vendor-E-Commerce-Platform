const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // Skip silently if email credentials not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped (EMAIL_USER / EMAIL_PASS not set)');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  await transporter.sendMail({
    from: `"HyperCart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`[Email] Sent to ${to}: ${subject}`);
};

module.exports = sendEmail;
