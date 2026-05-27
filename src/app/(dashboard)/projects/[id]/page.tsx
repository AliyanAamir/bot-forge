import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { hasProjectAccess } from "@/lib/project-access";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const access = await hasProjectAccess(id, session!.user.id);
  if (!access) notFound();

  const project = await db.project.findUnique({
    where: { id },
    include: {
      _count: { select: { knowledgeDocs: true, chatSessions: true, leads: true, members: true } },
    },
  });
  if (!project) notFound();

  const recentSessions = await db.chatSession.findMany({
    where: { projectId: id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { _count: { select: { messages: true } }, lead: true },
  });

  const stats = [
    { label: "Knowledge docs", value: project._count.knowledgeDocs, hint: "uploaded sources" },
    { label: "Conversations", value: project._count.chatSessions, hint: "total sessions" },
    { label: "Leads", value: project._count.leads, hint: "captured" },
    { label: "Team", value: project._count.members + 1, hint: "members" },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          {project.description || "Project at a glance."}
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm font-medium text-slate-700 mt-1">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.hint}</p>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent activity</h2>
          <span className="text-xs text-slate-500">Created {formatDate(project.createdAt)}</span>
        </div>
        {recentSessions.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">
            No conversations yet. Embed your widget to start collecting chats.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentSessions.map((s) => (
              <li key={s.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-800 font-mono text-xs">{s.visitorId.slice(0, 14)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s._count.messages} messages</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.lead && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      lead
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{formatDate(s.updatedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
