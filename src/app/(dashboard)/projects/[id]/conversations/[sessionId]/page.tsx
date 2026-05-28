import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/project/PageHeader";
import { Contact } from "lucide-react";

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
      <PageHeader
        title="Conversation"
        subtitle={`Visitor ${chat.visitorId.slice(0, 18)} · ${chat.messages.length} messages · started ${formatDate(chat.createdAt)}`}
        backHref={`/projects/${id}/conversations`}
        backLabel="Conversations"
      />

      <div className="grid lg:grid-cols-[1fr_16rem] gap-6 items-start">
        {/* Transcript */}
        <div className="panel panel-pad space-y-4">
          {chat.messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xl px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-ember text-white rounded-br-sm"
                    : "bg-sunk text-ink rounded-bl-sm border border-line"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                <p className={`text-[10px] mt-1.5 ${m.role === "user" ? "text-white/70" : "text-faint"}`}>
                  {formatDate(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lead sidecar */}
        {chat.lead && (
          <aside className="panel overflow-hidden lg:sticky lg:top-20">
            <div className="px-4 py-3 border-b border-line bg-success-soft/50 flex items-center gap-2">
              <Contact className="size-4 text-success" strokeWidth={1.75} />
              <span className="font-semibold text-ink text-sm">Lead captured</span>
            </div>
            <dl className="p-4 space-y-3 text-sm">
              {chat.lead.name && <Field k="Name" v={chat.lead.name} />}
              {chat.lead.email && <Field k="Email" v={chat.lead.email} />}
              {chat.lead.phone && <Field k="Phone" v={chat.lead.phone} />}
              <div className="pt-2 border-t border-line">
                <span className="badge badge-neutral capitalize">{chat.lead.status}</span>
              </div>
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-faint uppercase tracking-wide">{k}</dt>
      <dd className="text-ink mt-0.5 break-words">{v}</dd>
    </div>
  );
}
