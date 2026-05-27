import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LeadsTable } from "@/components/project/LeadsTable";

export default async function LeadsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({ where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] } });
  if (!project) notFound();

  const leads = await db.lead.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Leads</h1>
        <p className="text-slate-500 text-sm mt-1">Visitors who shared their contact info with the bot</p>
      </div>

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
    </div>
  );
}
