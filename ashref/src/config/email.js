const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@ashref.com',
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`✉️ Email sent to ${to}: ${subject}`);
    return result;
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error.message);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h1>Welcome to ashref!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining our platform. We're excited to have you on board.</p>
    <p>Best regards,<br/>The ashref Team</p>
  `;
  return sendEmail(email, 'Welcome to ashref', html);
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const html = `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, ignore this email.</p>
  `;
  return sendEmail(email, 'Password Reset Request', html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
