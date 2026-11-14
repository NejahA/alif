import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const scheduleEmailReminder = (io: any) => {
  // Run every day at 07:30 AM
  const cron = require('node-cron');
  cron.schedule('30 7 * * *', async () => {
    // Simple placeholder: send email to all ADMIN users
    const admins = await (await import('../prisma')).default.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@dreamscape.app',
        to: admin.email,
        subject: 'Daily Dream Reminder',
        text: 'Good morning! Remember to log your dreams today. 😊',
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Sent reminder to ${admin.email}`);
        io?.emit('emailSent', { to: admin.email });
      } catch (e) {
        console.error(`❌ Failed to send reminder to ${admin.email}:`, e);
      }
    }
  });
};

