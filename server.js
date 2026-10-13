import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.MAIL_PORT || process.env.PORT || 3001);
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const emailFromName = process.env.EMAIL_FROM_NAME || 'Student Performance Dashboard';

app.use(express.json());

async function sendWithProvider(url, headers, payload, provider) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`${provider} OTP delivery failed with HTTP ${response.status}`);
    throw new Error(`${provider} email delivery failed`);
  }
}

async function sendOtpEmail(email, otp, purpose) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const safePurpose = typeof purpose === 'string'
    ? purpose.replace(/[\r\n]/g, ' ').slice(0, 80)
    : 'Account';
  const text = `Your Student Performance Dashboard verification code is ${otp}. It expires in 5 minutes.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#172033">
      <h2>Student Performance Dashboard</h2>
      <p>Use this verification code to complete your registration:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4f46e5">${otp}</p>
      <p>This code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
    </div>
  `;

  if (brevoApiKey && !resendApiKey) {
    await sendWithProvider(
      'https://api.brevo.com/v3/smtp/email',
      { 'api-key': brevoApiKey, accept: 'application/json' },
      {
        sender: { name: emailFromName, email: emailFrom },
        to: [{ email }],
        subject: `${safePurpose} verification code`,
        htmlContent: html,
        textContent: text,
      },
      'Brevo',
    );
    return;
  }

  if (resendApiKey) {
    await sendWithProvider(
      'https://api.resend.com/emails',
      { Authorization: `Bearer ${resendApiKey}`, Accept: 'application/json' },
      {
        from: `${emailFromName} <${emailFrom}>`,
        to: [email],
        subject: `${safePurpose} verification code`,
        html,
        text,
      },
      'Resend',
    );
    return;
  }

  throw new Error('Configure RESEND_API_KEY or BREVO_API_KEY in .env');
}

app.post('/api/email/send-otp', async (req, res) => {
  const { email, otp, purpose } = req.body ?? {};

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)
    || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'A valid email address and 6-digit OTP are required.' });
  }

  try {
    await sendOtpEmail(email, otp, purpose);
    return res.json({ sent: true });
  } catch (error) {
    console.error('OTP email delivery failed:', error.message);
    return res.status(503).json({ message: 'Email delivery is unavailable. Check RESEND_API_KEY or BREVO_API_KEY and sender settings.' });
  }
});

app.listen(port, () => {
  console.log(`Mail server listening on http://localhost:${port}`);
});
