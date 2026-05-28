import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/project/PageHeader";
import { Pager } from "@/components/ui/Pager";
import { paginationFromRecord } from "@/lib/pagination";
import { MessageSquare, User, Bot, Contact } from "lucide-react";

export default async function ConversationsPage({
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
  const [sessions, total] = await db.$transaction([
    db.chatSession.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: p.skip,
      take: p.take,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        lead: true,
        _count: { select: { messages: true } },
      },
    }),
    db.chatSession.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize));

  return (
    <div>
      <PageHeader title="Conversations" subtitle="Every chat session with your bot." />

      {sessions.length === 0 ? (
        <EmptyConversations />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-faint border-b border-line bg-sunk/40">
                  <th className="px-5 py-3 font-medium">Visitor</th>
                  <th className="px-5 py-3 font-medium">Last message</th>
                  <th className="px-5 py-3 font-medium text-right">Messages</th>
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sessions.map((s) => {
                  const last = s.messages[0];
                  return (
                    <tr key={s.id} className="hover:bg-sunk/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/projects/${id}/conversations/${s.id}`}
                          className="text-ember-strong font-medium hover:underline font-mono text-xs"
                        >
                          {s.visitorId.slice(0, 14)}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted max-w-xs">
                        {last ? (
                          <span className="flex items-center gap-1.5 truncate">
                            {last.role === "user" ? (
                              <User className="size-3.5 text-faint shrink-0" strokeWidth={1.75} />
                            ) : (
                              <Bot className="size-3.5 text-faint shrink-0" strokeWidth={1.75} />
                            )}
                            <span className="truncate">{last.content}</span>
                          </span>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted text-right tabular-nums">{s._count.messages}</td>
                      <td className="px-5 py-3">
                        {s.lead ? (
                          <span className="badge badge-success">
                            <Contact className="size-3" strokeWidth={2} />
                            {s.lead.email || s.lead.phone || "captured"}
                          </span>
                        ) : (
                          <span className="text-faint text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-faint text-xs text-right">{formatDate(s.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pager
        page={p.page}
        totalPages={totalPages}
        total={total}
        pageSize={p.pageSize}
        basePath={`/projects/${id}/conversations`}
        searchParams={sp}
        noun="conversations"
      />
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className="panel flex flex-col items-center text-center px-6 py-16">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sunk text-faint mb-4">
        <MessageSquare className="size-6" strokeWidth={1.5} />
      </span>
      <p className="text-ink font-medium">No conversations yet</p>
      <p className="text-muted text-sm mt-1">Embed your widget to start collecting chats.</p>
    </div>
  );
}
