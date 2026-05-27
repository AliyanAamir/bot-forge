import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findFirst({ where: { id, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const leads = await db.lead.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { session: { select: { id: true, visitorId: true } } },
  });
  return NextResponse.json(leads);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findFirst({ where: { id, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getProjectRole(id, session.user.id);
  if (!can(role, "editContent")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { leadId, status, notes } = await req.json();
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const lead = await db.lead.findFirst({ where: { id: leadId, projectId: id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.lead.update({
    where: { id: leadId },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    },
  });
  return NextResponse.json(updated);
}
