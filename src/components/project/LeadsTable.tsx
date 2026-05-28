"use client";

import Link from "next/link";
import { useLeadsList, useUpdateLeadStatus } from "@/lib/api/hooks";
import { ClientPager } from "@/components/ui/ClientPager";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { QueryError } from "@/components/ui/QueryState";
import { Contact, ArrowRight, Loader2 } from "lucide-react";

const STATUSES = ["new", "contacted", "converted", "archived"];

export function LeadsTable({ projectId }: { projectId: string }) {
  const { items, page, total, totalPages, pageSize, isLoading, isError, error, refetch, isPlaceholder } =
    useLeadsList(projectId);
  const updateStatus = useUpdateLeadStatus(projectId);

  if (isLoading) return <TableSkeleton rows={8} cols={6} />;
  if (isError) return <QueryError message={error?.message} onRetry={refetch} />;

  if (total === 0) {
    return (
      <div className="panel flex flex-col items-center text-center px-6 py-16">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sunk text-faint mb-4">
          <Contact className="size-6" strokeWidth={1.5} />
        </span>
        <p className="text-ink font-medium">No leads captured yet</p>
        <p className="text-muted text-sm mt-1 max-w-sm">
          Enable lead capture in Configuration to start collecting contact info from conversations.
        </p>
      </div>
    );
  }

  const pendingId = updateStatus.isPending ? updateStatus.variables?.leadId : undefined;

  return (
    <>
      <div className={`panel overflow-hidden ${isPlaceholder ? "opacity-60 transition-opacity" : "transition-opacity"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-faint border-b border-line bg-sunk/40">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Captured</th>
                <th className="px-5 py-3 font-medium text-right">Chat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((l) => (
                <tr key={l.id} className="hover:bg-sunk/50 transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">{l.name || <span className="text-faint">—</span>}</td>
                  <td className="px-5 py-3 text-muted">{l.email || <span className="text-faint">—</span>}</td>
                  <td className="px-5 py-3 text-muted">{l.phone || <span className="text-faint">—</span>}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <select
                        value={l.status}
                        onChange={(e) => updateStatus.mutate({ leadId: l.id, status: e.target.value })}
                        disabled={pendingId === l.id}
                        className="select py-1.5 pl-2.5 pr-8 text-xs w-auto capitalize"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {pendingId === l.id && <Loader2 className="size-3.5 animate-spin text-faint" />}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-faint text-xs whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/projects/${projectId}/conversations/${l.sessionId}`}
                      className="inline-flex items-center gap-1 text-ember-strong hover:underline text-xs font-medium"
                    >
                      View <ArrowRight className="size-3" strokeWidth={2} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClientPager
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        basePath={`/projects/${projectId}/leads`}
        noun="leads"
        busy={isPlaceholder}
      />
    </>
  );
}
