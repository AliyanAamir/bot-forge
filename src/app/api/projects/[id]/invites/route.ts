import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can, INVITABLE_ROLES } from "@/lib/permissions";
import { sendInviteEmail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rate-limit";

const INVITE_TTL_DAYS = 7;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await getProjectRole(id, session.user.id);
  if (!can(role, "view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invites = await db.invite.findMany({
    where: { projectId: id, acceptedAt: null },
    orderBy: { createdAt: "desc" },
    include: { invitedBy: { select: { name: true, email: true } } },
  });
  return NextResponse.json(invites);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await getProjectRole(id, session.user.id);
  if (!can(role, "manageTeam")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userLimit = rateLimit({ key: `invite:user:${session.user.id}`, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!userLimit.ok) {
    return NextResponse.json(
      { error: `Invite limit reached. Try again in ${Math.ceil(userLimit.resetMs / 60000)} min.` },
      { status: 429 }
    );
  }
  const projectLimit = rateLimit({ key: `invite:project:${id}`, limit: 5, windowMs: 60 * 1000 });
  if (!projectLimit.ok) {
    return NextResponse.json(
      { error: "Too many invites just sent on this project. Wait a minute and retry." },
      { status: 429 }
    );
  }

  const { email, role: inviteRole = "viewer" } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  if (!(INVITABLE_ROLES as string[]).includes(inviteRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const project = await db.project.findUnique({
    where: { id },
    select: { name: true, userId: true },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const existingUser = await db.user.findUnique({ where: { email: normalized } });
  if (existingUser) {
    if (existingUser.id === project.userId) {
      return NextResponse.json({ error: "User is the project owner" }, { status: 400 });
    }
    const member = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: existingUser.id } },
    });
    if (member) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }
  }

  const pending = await db.invite.findFirst({
    where: { projectId: id, email: normalized, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (pending) {
    return NextResponse.json(
      { error: "A pending invite already exists for this email. Revoke it first if you want to resend." },
      { status: 409 }
    );
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invite = await db.invite.create({
    data: {
      projectId: id,
      email: normalized,
      token,
      role: inviteRole,
      expiresAt,
      invitedById: session.user.id,
    },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  try {
    await sendInviteEmail({
      to: normalized,
      inviteLink: `${appUrl}/invites/${token}`,
      projectName: project.name,
      invitedByName: session.user.name ?? "",
      invitedByEmail: session.user.email ?? "",
      role: inviteRole,
    });
  } catch (err) {
    console.error("[invite email]", err);
    // keep invite record even if email fails — owner can copy link manually
  }

  return NextResponse.json({ ...invite, link: `${appUrl}/invites/${token}` });
}
