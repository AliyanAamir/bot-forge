import { BrevoClient } from "@getbrevo/brevo";

const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function getClient() {
  return new BrevoClient({ apiKey: process.env.BREVO_API_KEY ?? "" });
}

const FROM = {
  email: process.env.BREVO_SENDER_EMAIL ?? "noreply@botforge.dev",
  name: process.env.BREVO_SENDER_NAME ?? "BotForge",
};

async function send(to: string, subject: string, htmlContent: string) {
  const client = getClient();
  await client.transactionalEmails.sendTransacEmail({
    sender: FROM,
    to: [{ email: to }],
    subject,
    htmlContent,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await send(
    to,
    "Welcome to BotForge 🎉",
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1e293b">
      <div style="background:#6366f1;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:24px">
        <span style="color:#fff;font-weight:700;font-size:20px">B</span>
      </div>
      <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Welcome to BotForge, ${name || "there"}!</h1>
      <p style="color:#64748b;line-height:1.6;margin:0 0 24px">
        Your account is ready. Create your first AI chatbot, train it with your knowledge base, and embed it on any website in minutes.
      </p>
      <a href="${appUrl}/dashboard" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
        Go to dashboard →
      </a>
      <p style="color:#94a3b8;font-size:13px;margin-top:32px">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
    `
  );
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${appUrl}/api/auth/verify-email?token=${token}`;
  await send(
    to,
    "Verify your BotForge email",
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1e293b">
      <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Verify your email</h1>
      <p style="color:#64748b;line-height:1.6;margin:0 0 24px">
        Click the button below to verify your email address. This link expires in 24 hours.
      </p>
      <a href="${link}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
        Verify email →
      </a>
      <p style="color:#94a3b8;font-size:13px;margin-top:24px">
        Or paste this link in your browser:<br/>
        <span style="color:#6366f1">${link}</span>
      </p>
      <p style="color:#94a3b8;font-size:13px;margin-top:32px">
        If you didn't sign up for BotForge, you can safely ignore this email.
      </p>
    </div>
    `
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${appUrl}/reset-password?token=${token}`;
  await send(
    to,
    "Reset your BotForge password",
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1e293b">
      <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Reset your password</h1>
      <p style="color:#64748b;line-height:1.6;margin:0 0 24px">
        We received a request to reset the password for your account. Click the button below — this link expires in 1 hour.
      </p>
      <a href="${link}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
        Reset password →
      </a>
      <p style="color:#94a3b8;font-size:13px;margin-top:24px">
        Or paste this link in your browser:<br/>
        <span style="color:#6366f1">${link}</span>
      </p>
      <p style="color:#94a3b8;font-size:13px;margin-top:32px">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
    `
  );
}
