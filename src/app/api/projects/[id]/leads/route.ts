import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can } from "@/lib/permissions";
import { paginationFromSearchParams, paginate } from "@/lib/pagination";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findFirst({ where: { id, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = paginationFromSearchParams(req.nextUrl.searchParams);
  const where = { projectId: id };
  const [leads, total] = await db.$transaction([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { session: { select: { id: true, visitorId: true } } },
      skip: p.skip,
      take: p.take,
    }),
    db.lead.count({ where }),
  ]);
  return NextResponse.json(paginate(leads, total, p));
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
