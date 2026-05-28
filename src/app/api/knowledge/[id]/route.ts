import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectRole } from "@/lib/project-access";
import { can } from "@/lib/permissions";
import { paginationFromSearchParams, paginate } from "@/lib/pagination";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;

  const project = await db.project.findFirst({ where: { id: projectId, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = paginationFromSearchParams(req.nextUrl.searchParams);
  const where = { projectId };
  const [docs, total] = await db.$transaction([
    db.knowledgeDoc.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
    }),
    db.knowledgeDoc.count({ where }),
  ]);

  return NextResponse.json(paginate(docs, total, p));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;

  const project = await db.project.findFirst({ where: { id: projectId, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getProjectRole(projectId, session.user.id);
  if (!can(role, "editContent")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, source, type } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  const doc = await db.knowledgeDoc.create({
    data: {
      projectId,
      title: title.trim(),
      content: content.trim(),
      source: source?.trim() || null,
      type: type || "text",
    },
  });

  return NextResponse.json(doc, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  const { docId } = await req.json();

  const project = await db.project.findFirst({ where: { id: projectId, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getProjectRole(projectId, session.user.id);
  if (!can(role, "editContent")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.knowledgeDoc.delete({ where: { id: docId, projectId } });
  return NextResponse.json({ success: true });
}
