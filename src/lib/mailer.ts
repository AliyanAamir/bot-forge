import { Resend } from "resend";
import InviteEmail from "@/emails/InviteEmail";

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
