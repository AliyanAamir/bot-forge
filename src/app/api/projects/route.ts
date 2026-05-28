import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/utils";
import { paginationFromSearchParams, paginate } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const p = paginationFromSearchParams(req.nextUrl.searchParams);
  const where = {
    OR: [
      { userId: session.user.id },
      { members: { some: { userId: session.user.id } } },
    ],
  };
  const [projects, total] = await db.$transaction([
    db.project.findMany({
      where,
      include: { config: true, _count: { select: { knowledgeDocs: true, chatSessions: true } } },
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
    }),
    db.project.count({ where }),
  ]);

  return NextResponse.json(paginate(projects, total, p));
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
