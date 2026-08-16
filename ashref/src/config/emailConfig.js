const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email
exports.sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send verification email
exports.sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const subject = 'Email Verification';
  const html = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationLink}">${verificationLink}</a>
    <p>This link will expire in 24 hours.</p>
  `;

  return exports.sendEmail(email, subject, 'Please verify your email', html);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const subject = 'Password Reset';
  const html = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 1 hour.</p>
  `;

  return exports.sendEmail(email, subject, 'Reset your password', html);
};

// Send notification email
exports.sendNotificationEmail = async (email, title, message) => {
  const html = `
    <h2>${title}</h2>
    <p>${message}</p>
  `;

  return exports.sendEmail(email, title, message, html);
};

module.exports = exports;
