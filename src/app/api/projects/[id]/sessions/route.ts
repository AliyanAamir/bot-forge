import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paginationFromSearchParams, paginate } from "@/lib/pagination";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.project.findFirst({ where: { id, OR: [{ userId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = paginationFromSearchParams(req.nextUrl.searchParams);
  const where = { projectId: id };
  const [sessions, total] = await db.$transaction([
    db.chatSession.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        lead: true,
        _count: { select: { messages: true } },
      },
    }),
    db.chatSession.count({ where }),
  ]);

  return NextResponse.json(
    paginate(
      sessions.map((s) => ({
        id: s.id,
        visitorId: s.visitorId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        messageCount: s._count.messages,
        lastMessage: s.messages[0]?.content ?? null,
        lastMessageRole: s.messages[0]?.role ?? null,
        lead: s.lead
          ? { id: s.lead.id, name: s.lead.name, email: s.lead.email, phone: s.lead.phone, status: s.lead.status }
          : null,
      })),
      total,
      p,
    ),
  );
}
