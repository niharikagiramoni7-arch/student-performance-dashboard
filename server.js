import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
const port = Number(process.env.MAIL_PORT || 3001);

app.use(express.json());

function createTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);

  if (!user || !pass) {
    throw new Error('Missing SMTP credentials: EMAIL_USER and EMAIL_APP_PASSWORD (or SMTP_USER and SMTP_PASSWORD) must be set in .env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

app.post('/api/email/send-otp', async (req, res) => {
  const { email, otp, purpose } = req.body ?? {};

  if (!/^\S+@\S+\.\S+$/.test(email ?? '') || !/^\d{6}$/.test(otp ?? '')) {
    return res.status(400).json({ message: 'A valid email address and 6-digit OTP are required.' });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `${purpose || 'Account'} verification code`,
      text: `Your Student Performance Dashboard verification code is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#172033">
          <h2>Student Performance Dashboard</h2>
          <p>Use this verification code to complete your registration:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4f46e5">${otp}</p>
          <p>This code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
        </div>
      `,
    });
    return res.json({ sent: true });
  } catch (error) {
    console.error('OTP email delivery failed:', error.message);
    return res.status(503).json({ message: 'Email delivery is unavailable. Check the SMTP settings and try again.' });
  }
});

app.listen(port, () => {
  console.log(`Mail server listening on http://localhost:${port}`);
});
