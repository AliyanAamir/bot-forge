import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CreateProjectButton } from "@/components/dashboard/CreateProjectButton";

export default async function DashboardPage() {
  const session = await auth();
  const projects = await db.project.findMany({
    where: { userId: session!.user.id },
    include: {
      config: true,
      _count: { select: { knowledgeDocs: true, chatSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateProjectButton />
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No projects yet</h2>
          <p className="text-slate-500 text-sm mb-6">
            Create your first chatbot project to get started.
          </p>
          <CreateProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: p.config?.primaryColor || "#6366f1" }}
                >
                  {p.name[0].toUpperCase()}
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                  {formatDate(p.createdAt)}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1">
                {p.name}
              </h3>
              {p.description && (
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{p.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-100">
                <span>{p._count.knowledgeDocs} docs</span>
                <span>{p._count.chatSessions} sessions</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
