import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", req.url));
  }

  const record = await db.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    await db.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
  }

  await Promise.all([
    db.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
