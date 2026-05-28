import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { hasProjectAccess } from "@/lib/project-access";
import { BookOpen, MessageSquare, Contact, Users } from "lucide-react";

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
    { label: "Knowledge", value: project._count.knowledgeDocs, icon: BookOpen },
    { label: "Conversations", value: project._count.chatSessions, icon: MessageSquare },
    { label: "Leads", value: project._count.leads, icon: Contact },
    { label: "Team", value: project._count.members + 1, icon: Users },
  ];

  return (
    <div>
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Overview</h1>
        <p className="text-muted text-sm mt-1">
          {project.description || "Your chatbot at a glance."}
        </p>
      </header>

      {/* Stat strip: one panel, divided columns (not four identical cards) */}
      <div className="panel grid grid-cols-2 lg:grid-cols-4 divide-y divide-x divide-line mb-8 overflow-hidden">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5">
              <div className="flex items-center gap-2 text-muted">
                <Icon className="size-4 text-faint" strokeWidth={1.75} />
                <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-3xl font-semibold text-ink mt-2 tabular-nums">{s.value}</p>
            </div>
          );
        })}
      </div>

      <section className="panel overflow-hidden">
        <div className="panel-head">
          <h2 className="font-semibold text-ink">Recent activity</h2>
          <span className="text-xs text-faint">Created {formatDate(project.createdAt)}</span>
        </div>
        {recentSessions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-muted text-sm">No conversations yet.</p>
            <p className="text-faint text-xs mt-1">Embed your widget to start collecting chats.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recentSessions.map((s) => (
              <li key={s.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-ink font-mono text-xs truncate">{s.visitorId.slice(0, 18)}</p>
                  <p className="text-xs text-faint mt-0.5">{s._count.messages} messages</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {s.lead && (
                    <span className="badge badge-success">
                      <Contact className="size-3" strokeWidth={2} />
                      lead
                    </span>
                  )}
                  <span className="text-xs text-faint">{formatDate(s.updatedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
