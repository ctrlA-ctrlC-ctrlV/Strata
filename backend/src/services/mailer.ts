import nodemailer from 'nodemailer';

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error('SMTP configuration missing');
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const transporter = createTransport();
  const from = process.env.SMTP_FROM || `no-reply@${(process.env.BASE_URL || 'example.com').replace(/^https?:\/\//,'')}`;
  await transporter.sendMail({ from, ...opts });
}
