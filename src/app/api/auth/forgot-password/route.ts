import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });

  // Always return 200 to avoid leaking whether an email is registered
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Delete any existing tokens for this email
  await db.passwordResetToken.deleteMany({ where: { email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({ data: { email, token, expires } });

  sendPasswordResetEmail(email, token).catch((err) => console.error("[EMAIL]", err));

  return NextResponse.json({ ok: true });
}
