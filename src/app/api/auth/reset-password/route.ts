import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const vt = await db.verificationToken.findUnique({ where: { token } });
  if (!vt || !vt.identifier.startsWith("password-reset:")) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }
  if (vt.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "Reset link has expired. Request a new one." }, { status: 400 });
  }

  const email = vt.identifier.replace("password-reset:", "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const hash = await bcrypt.hash(password, 12);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { password: hash } }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ success: true });
}
