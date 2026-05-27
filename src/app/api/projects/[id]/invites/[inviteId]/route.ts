import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can } from "@/lib/permissions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, inviteId } = await params;
  const role = await getProjectRole(id, session.user.id);
  if (!can(role, "manageTeam")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.invite.deleteMany({ where: { id: inviteId, projectId: id } });
  return NextResponse.json({ success: true });
}
