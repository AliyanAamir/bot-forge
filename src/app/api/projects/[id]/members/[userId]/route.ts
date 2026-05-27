import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can, INVITABLE_ROLES } from "@/lib/permissions";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;
  const isSelf = userId === session.user.id;
  const role = await getProjectRole(id, session.user.id);

  if (!isSelf && !can(role, "manageTeam")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await db.project.findUnique({ where: { id }, select: { userId: true } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (userId === project.userId) {
    return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 });
  }

  await db.projectMember.deleteMany({ where: { projectId: id, userId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;
  const role = await getProjectRole(id, session.user.id);
  if (role !== "owner") return NextResponse.json({ error: "Only the owner can change roles" }, { status: 403 });

  const { role: newRole } = await req.json();
  if (!(INVITABLE_ROLES as string[]).includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await db.projectMember.update({
    where: { projectId_userId: { projectId: id, userId } },
    data: { role: newRole },
  });
  return NextResponse.json(updated);
}
