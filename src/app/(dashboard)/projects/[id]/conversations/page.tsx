import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ConversationsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, OR: [{ userId: session!.user.id }, { members: { some: { userId: session!.user.id } } }] },
  });
  if (!project) notFound();

  const sessions = await db.chatSession.findMany({
    where: { projectId: id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      lead: true,
      _count: { select: { messages: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700">
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Conversations</h1>
        <p className="text-slate-500 text-sm mt-1">All chat sessions with your bot</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500">No conversations yet. Embed your widget to start collecting chats.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Visitor</th>
                <th className="px-5 py-3 font-medium">Last message</th>
                <th className="px-5 py-3 font-medium">Messages</th>
                <th className="px-5 py-3 font-medium">Lead</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const last = s.messages[0];
                return (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/projects/${id}/conversations/${s.id}`} className="text-indigo-600 font-medium hover:underline font-mono text-xs">
                        {s.visitorId.slice(0, 12)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">
                      {last ? `${last.role === "user" ? "👤" : "🤖"} ${last.content}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s._count.messages}</td>
                    <td className="px-5 py-3">
                      {s.lead ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          ✓ {s.lead.email || s.lead.phone || "captured"}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(s.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
