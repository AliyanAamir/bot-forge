import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;
  const role = await getProjectRole(id, session.user.id);
  if (role !== "owner") {
    return NextResponse.json({ error: "Only the project owner can reset member passwords" }, { status: 403 });
  }

  const [project, membership] = await Promise.all([
    db.project.findUnique({ where: { id }, select: { name: true } }),
    db.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
      select: { user: { select: { id: true, email: true, password: true } } },
    }),
  ]);

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  // Return the same shape whether the member doesn't exist or has no password — avoids enumeration.
  if (!membership?.user?.password) {
    return NextResponse.json({ sent: true });
  }
  const user = membership.user;

  const identifier = `password-reset:${user.email}`;
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({ data: { identifier, token, expires } });

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail({
    to: user.email,
    resetLink,
    requestedByOwner: true,
    projectName: project.name,
  });

  return NextResponse.json({ sent: true });
}
