import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can } from "@/lib/permissions";

function newApiKey() {
  return "cbk_" + randomBytes(24).toString("base64url");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await getProjectRole(id, session.user.id);
  if (!can(role, "manageApiKey")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = await req.json();

  if (action === "rotate") {
    const updated = await db.project.update({
      where: { id },
      data: { apiKey: newApiKey(), apiKeyRotatedAt: new Date(), apiKeyRevokedAt: null },
      select: { apiKey: true, apiKeyRotatedAt: true, apiKeyRevokedAt: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "revoke") {
    const updated = await db.project.update({
      where: { id },
      data: { apiKeyRevokedAt: new Date() },
      select: { apiKey: true, apiKeyRotatedAt: true, apiKeyRevokedAt: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "reactivate") {
    const updated = await db.project.update({
      where: { id },
      data: { apiKeyRevokedAt: null },
      select: { apiKey: true, apiKeyRotatedAt: true, apiKeyRevokedAt: true },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
