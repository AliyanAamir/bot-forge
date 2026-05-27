import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const record = await db.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    await db.passwordResetToken.deleteMany({ where: { token } }).catch(() => {});
    return NextResponse.json({ error: "Token is invalid or has expired" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await Promise.all([
    db.user.update({
      where: { email: record.email },
      data: { password: hashed },
    }),
    db.passwordResetToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ ok: true });
}
