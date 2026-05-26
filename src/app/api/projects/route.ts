import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    include: { config: true, _count: { select: { knowledgeDocs: true, chatSessions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Project name required" }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      apiKey: generateApiKey(),
      userId: session.user.id,
      config: { create: {} },
    },
    include: { config: true },
  });

  return NextResponse.json(project, { status: 201 });
}
