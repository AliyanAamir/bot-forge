import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      config: true,
      _count: { select: { knowledgeDocs: true, chatSessions: true } },
    },
  });

  if (!project) notFound();

  const tabs = [
    { label: "Configuration", href: `/projects/${id}/config`, icon: "⚙️" },
    { label: "Knowledge Base", href: `/projects/${id}/knowledge`, icon: "📚" },
    { label: "Widget & Embed", href: `/projects/${id}/widget`, icon: "🔌" },
  ];

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          ← Back to projects
        </Link>
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: project.config?.primaryColor || "#6366f1" }}
          >
            {project.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="text-slate-500 mt-0.5 text-sm">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Knowledge docs", value: project._count.knowledgeDocs },
          { label: "Chat sessions", value: project._count.chatSessions },
          { label: "Created", value: formatDate(project.createdAt) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Navigation tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all text-left"
          >
            <div className="text-3xl mb-3">{tab.icon}</div>
            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {tab.label}
            </h3>
          </Link>
        ))}
      </div>

      {/* API Key preview */}
      <div className="mt-8 bg-slate-900 rounded-2xl p-6">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">API Key</p>
        <div className="flex items-center gap-3">
          <code className="text-green-400 text-sm font-mono flex-1 truncate">{project.apiKey}</code>
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Use this key in your embed script to activate the chatbot. Keep it secret.
        </p>
      </div>
    </div>
  );
}
