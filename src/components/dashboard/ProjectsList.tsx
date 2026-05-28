"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useProjects, PAGE_SIZE } from "@/lib/api/hooks";
import { qk } from "@/lib/api/keys";
import { apiGet, listQuery } from "@/lib/api/client";
import type { Paginated, ProjectListItem } from "@/lib/api/types";
import { usePageParam, ClientPager } from "@/components/ui/ClientPager";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { QueryError } from "@/components/ui/QueryState";
import { CreateProjectButton } from "./CreateProjectButton";
import { BookOpen, MessageSquare, ChevronRight, Bot } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ProjectsList() {
  const page = usePageParam();
  const qc = useQueryClient();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProjects(page);

  // Prefetch the next page so forward navigation is instant.
  const totalPages = data?.totalPages ?? 1;
  useEffect(() => {
    if (page < totalPages) {
      qc.prefetchQuery({
        queryKey: qk.projects(page + 1),
        queryFn: () =>
          apiGet<Paginated<ProjectListItem>>(`/api/projects${listQuery({ page: page + 1, pageSize: PAGE_SIZE })}`),
      });
    }
  }, [page, totalPages, qc]);

  const total = data?.total ?? 0;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Projects</h1>
          <p className="text-muted mt-1 text-sm">
            {isPending
              ? "Loading your workshop…"
              : total === 0
                ? "Your workshop is empty."
                : `${total} chatbot${total !== 1 ? "s" : ""} in your workshop.`}
          </p>
        </div>
        {total > 0 && <CreateProjectButton />}
      </div>

      {isPending ? (
        <ListSkeleton rows={5} />
      ) : isError ? (
        <QueryError message={error.message} onRetry={() => refetch()} />
      ) : total === 0 ? (
        <div className="panel flex flex-col items-center text-center px-6 py-20">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-ember-soft text-ember-strong mb-5">
            <Bot className="size-7" strokeWidth={1.5} />
          </span>
          <h2 className="text-lg font-semibold text-ink mb-1.5">Forge your first bot</h2>
          <p className="text-muted text-sm mb-6 max-w-sm leading-relaxed">
            A project holds one chatbot: its knowledge, voice, and the widget you embed on your site.
          </p>
          <CreateProjectButton />
        </div>
      ) : (
        <>
          <ul
            className={`panel divide-y divide-line overflow-hidden ${isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}`}
          >
            {data.data.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-sunk outline-none focus-visible:bg-sunk"
                >
                  <div
                    className="size-11 rounded-xl flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-[0_1px_2px_oklch(0.4_0.05_60/0.25)]"
                    style={{ backgroundColor: p.config?.primaryColor || "var(--color-ember)" }}
                  >
                    {p.name[0].toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-semibold text-ink truncate group-hover:text-ember-strong transition-colors">
                        {p.name}
                      </h3>
                      <span className="hidden sm:inline text-xs text-faint shrink-0">{formatDate(p.createdAt)}</span>
                    </div>
                    {p.description && <p className="text-muted text-sm truncate mt-0.5">{p.description}</p>}
                  </div>

                  <div className="hidden md:flex items-center gap-5 text-sm text-muted shrink-0">
                    <span className="inline-flex items-center gap-1.5" title="Knowledge docs">
                      <BookOpen className="size-4 text-faint" strokeWidth={1.75} />
                      {p._count.knowledgeDocs}
                    </span>
                    <span className="inline-flex items-center gap-1.5" title="Conversations">
                      <MessageSquare className="size-4 text-faint" strokeWidth={1.75} />
                      {p._count.chatSessions}
                    </span>
                  </div>

                  <ChevronRight
                    className="size-4 text-faint shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-ember"
                    strokeWidth={1.75}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <ClientPager
            page={page}
            totalPages={data.totalPages}
            total={total}
            pageSize={data.pageSize}
            basePath="/dashboard"
            noun="projects"
            busy={isPlaceholderData}
          />
        </>
      )}
    </div>
  );
}
