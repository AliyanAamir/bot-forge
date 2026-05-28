import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { LeadsTable } from "@/components/project/LeadsTable";
import { PageHeader } from "@/components/project/PageHeader";
import { Pager } from "@/components/ui/Pager";
import { paginationFromRecord } from "@/lib/pagination";

export default async function LeadsPage({
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

  const project = await db.project.findFirst({ where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] } });
  if (!project) notFound();

  const where = { projectId: id };
  const [leads, total] = await db.$transaction([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
    }),
    db.lead.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize));

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Visitors who shared their contact info with the bot."
      />
      <LeadsTable projectId={id} initialLeads={leads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        status: l.status,
        notes: l.notes,
        sessionId: l.sessionId,
        createdAt: l.createdAt.toISOString(),
      }))} />
      <Pager
        page={p.page}
        totalPages={totalPages}
        total={total}
        pageSize={p.pageSize}
        basePath={`/projects/${id}/leads`}
        searchParams={sp}
        noun="leads"
      />
    </div>
  );
}
