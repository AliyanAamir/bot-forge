import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const auths = await auth();
  const { id, sessionId } = await params;

  const project = await db.project.findFirst({ where: { id, OR: [{ userId: auths!.user.id }, { members: { some: { userId: auths!.user.id } } }] } });
  if (!project) notFound();

  const chat = await db.chatSession.findFirst({
    where: { id: sessionId, projectId: id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      lead: true,
    },
  });
  if (!chat) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/projects/${id}/conversations`} className="text-sm text-slate-500 hover:text-slate-700">
          ← Conversations
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Visitor <span className="font-mono text-base">{chat.visitorId}</span></h1>
            <p className="text-slate-500 text-sm mt-1">Started {formatDate(chat.createdAt)} · {chat.messages.length} messages</p>
          </div>
          {chat.lead && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm min-w-64">
              <p className="font-semibold text-emerald-800 mb-1">Lead captured</p>
              {chat.lead.name && <p className="text-emerald-700">{chat.lead.name}</p>}
              {chat.lead.email && <p className="text-emerald-700">{chat.lead.email}</p>}
              {chat.lead.phone && <p className="text-emerald-700">{chat.lead.phone}</p>}
              <p className="text-xs text-emerald-600 mt-2 uppercase tracking-wide">Status: {chat.lead.status}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        {chat.messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl px-4 py-2.5 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <p className={`text-[10px] mt-1 ${m.role === "user" ? "text-indigo-200" : "text-slate-400"}`}>
                {formatDate(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
