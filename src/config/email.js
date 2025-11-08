import sgMail from "@sendgrid/mail";

export const initEmail = () => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("⚠️ SENDGRID_API_KEY missing; emails will be skipped.");
    return false;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return true;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) return { skipped: true };
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    return { ok: true };
  } catch (e) {
    console.error("SendGrid error:", e.response?.body || e.message);
    return { ok: false, error: e.message };
  }
};
