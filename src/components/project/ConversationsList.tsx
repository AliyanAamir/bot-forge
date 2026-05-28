"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useConversations, PAGE_SIZE } from "@/lib/api/hooks";
import { qk } from "@/lib/api/keys";
import { apiGet, listQuery } from "@/lib/api/client";
import type { Paginated, ConversationListItem } from "@/lib/api/types";
import { usePageParam, ClientPager } from "@/components/ui/ClientPager";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { QueryError } from "@/components/ui/QueryState";
import { MessageSquare, User, Bot, Contact } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ConversationsList({ projectId }: { projectId: string }) {
  const page = usePageParam();
  const qc = useQueryClient();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useConversations(projectId, page);

  const totalPages = data?.totalPages ?? 1;
  useEffect(() => {
    if (page < totalPages) {
      qc.prefetchQuery({
        queryKey: qk.conversations(projectId, page + 1),
        queryFn: () =>
          apiGet<Paginated<ConversationListItem>>(
            `/api/projects/${projectId}/sessions${listQuery({ page: page + 1, pageSize: PAGE_SIZE })}`,
          ),
      });
    }
  }, [page, totalPages, projectId, qc]);

  if (isPending) return <TableSkeleton rows={8} cols={5} />;
  if (isError) return <QueryError message={error.message} onRetry={() => refetch()} />;

  if (data.total === 0) {
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

  return (
    <>
      <div className={`panel overflow-hidden ${isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}`}>
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
              {data.data.map((s) => (
                <tr key={s.id} className="hover:bg-sunk/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/projects/${projectId}/conversations/${s.id}`}
                      className="text-ember-strong font-medium hover:underline font-mono text-xs"
                    >
                      {s.visitorId.slice(0, 14)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted max-w-xs">
                    {s.lastMessage ? (
                      <span className="flex items-center gap-1.5 truncate">
                        {s.lastMessageRole === "user" ? (
                          <User className="size-3.5 text-faint shrink-0" strokeWidth={1.75} />
                        ) : (
                          <Bot className="size-3.5 text-faint shrink-0" strokeWidth={1.75} />
                        )}
                        <span className="truncate">{s.lastMessage}</span>
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted text-right tabular-nums">{s.messageCount}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClientPager
        page={page}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={data.pageSize}
        basePath={`/projects/${projectId}/conversations`}
        noun="conversations"
        busy={isPlaceholderData}
      />
    </>
  );
}
