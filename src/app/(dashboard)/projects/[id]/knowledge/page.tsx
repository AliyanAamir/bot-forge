import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { KnowledgeManager } from "@/components/project/KnowledgeManager";
import { PageHeader } from "@/components/project/PageHeader";
import { Pager } from "@/components/ui/Pager";
import { paginationFromRecord } from "@/lib/pagination";

export default async function KnowledgePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const { id } = await params;
  const sp = await searchParams;
  const p = paginationFromRecord(sp);

  const project = await db.project.findFirst({
    where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] },
  });

  if (!project) notFound();

  const where = { projectId: id };
  const [docs, total] = await db.$transaction([
    db.knowledgeDoc.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
    }),
    db.knowledgeDoc.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize));

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        subtitle="The material your bot answers from. Add docs, FAQs, policies, and guides."
      />
      <KnowledgeManager projectId={id} initialDocs={docs.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))} />
      <Pager
        page={p.page}
        totalPages={totalPages}
        total={total}
        pageSize={p.pageSize}
        basePath={`/projects/${id}/knowledge`}
        searchParams={sp}
        noun="documents"
      />
    </div>
  );
}
