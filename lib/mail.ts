import nodemailer from "nodemailer";

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

let transporter: nodemailer.Transporter | null = null;

function ensureTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Missing SMTP configuration (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMail(opts: MailOptions) {
  const t = ensureTransporter();
  const from = opts.from ?? process.env.EMAIL_FROM ?? `no-reply@${process.env.NEXT_PUBLIC_SITE_URL ?? "spotless-sorted.local"}`;
  return await t.sendMail({
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    from,
  });
}
