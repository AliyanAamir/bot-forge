import { Resend } from "resend";
import InviteEmail from "@/emails/InviteEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

interface InviteEmailArgs {
  to: string;
  inviteLink: string;
  projectName: string;
  invitedByName: string;
  invitedByEmail: string;
  role: string;
}

export async function sendInviteEmail(args: InviteEmailArgs) {
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "BotForge";

  if (!resend || !from) {
    console.warn("[mailer] RESEND_API_KEY or EMAIL_FROM not set — logging invite instead.");
    console.log("[mailer] Invite link:", args.inviteLink);
    return { dryRun: true, link: args.inviteLink };
  }

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${from}>`,
    to: args.to,
    subject: `You're invited to ${args.projectName} on BotForge`,
    react: InviteEmail(args),
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
  return data;
}

interface PasswordResetEmailArgs {
  to: string;
  resetLink: string;
  requestedByOwner?: boolean;
  projectName?: string;
}

export async function sendPasswordResetEmail(args: PasswordResetEmailArgs) {
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "BotForge";

  if (!resend || !from) {
    console.warn("[mailer] RESEND_API_KEY or EMAIL_FROM not set — logging reset link instead.");
    console.log("[mailer] Reset link:", args.resetLink);
    return { dryRun: true, link: args.resetLink };
  }

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${from}>`,
    to: args.to,
    subject: "Reset your BotForge password",
    react: PasswordResetEmail(args),
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
  return data;
}
