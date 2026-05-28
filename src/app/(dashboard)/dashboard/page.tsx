import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectButton";
import { Pager } from "@/components/ui/Pager";
import { paginationFromRecord } from "@/lib/pagination";
import { BookOpen, MessageSquare, ChevronRight, Bot } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const p = paginationFromRecord(sp);

  const where = {
    OR: [
      { userId: session!.user.id },
      { members: { some: { userId: session!.user.id } } },
    ],
  };
  const [projects, total] = await db.$transaction([
    db.project.findMany({
      where,
      include: {
        config: true,
        _count: { select: { knowledgeDocs: true, chatSessions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: p.skip,
      take: p.take,
    }),
    db.project.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize));

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Projects</h1>
          <p className="text-muted mt-1 text-sm">
            {total === 0
              ? "Your workshop is empty."
              : `${total} chatbot${total !== 1 ? "s" : ""} in your workshop.`}
          </p>
        </div>
        {total > 0 && <CreateProjectButton />}
      </div>

      {total === 0 ? (
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
        <ul className="panel divide-y divide-line overflow-hidden">
          {projects.map((p) => (
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
                    <span className="hidden sm:inline text-xs text-faint shrink-0">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-muted text-sm truncate mt-0.5">{p.description}</p>
                  )}
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
      )}

      <Pager
        page={p.page}
        totalPages={totalPages}
        total={total}
        pageSize={p.pageSize}
        basePath="/dashboard"
        searchParams={sp}
        noun="projects"
      />
    </div>
  );
}
