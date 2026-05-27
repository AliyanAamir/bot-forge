import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const invite = await db.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account already exists for this email. Sign in to accept the invite." },
      { status: 409 }
    );
  }

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password (min 8 chars) required" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { email: invite.email, name: name?.trim() || null, password: hash, role: "user" },
  });

  await db.$transaction([
    db.projectMember.upsert({
      where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
      update: { role: invite.role },
      create: { projectId: invite.projectId, userId: user.id, role: invite.role },
    }),
    db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);

  return NextResponse.json({
    email: user.email,
    projectId: invite.projectId,
  });
}
