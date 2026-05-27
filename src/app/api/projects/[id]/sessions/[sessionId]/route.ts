import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const auths = await auth();
  if (!auths?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, sessionId } = await params;
  const project = await db.project.findFirst({ where: { id, OR: [{ userId: auths.user.id }, { members: { some: { userId: auths.user.id } } }] } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const chat = await db.chatSession.findFirst({
    where: { id: sessionId, projectId: id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      lead: true,
    },
  });

  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(chat);
}
