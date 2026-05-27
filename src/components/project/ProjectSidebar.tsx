"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Overview", path: "", icon: "🏠" },
  { label: "Configuration", path: "config", icon: "⚙️" },
  { label: "Knowledge Base", path: "knowledge", icon: "📚" },
  { label: "Conversations", path: "conversations", icon: "💬" },
  { label: "Leads", path: "leads", icon: "📇" },
  { label: "Team", path: "team", icon: "👥" },
  { label: "API Key", path: "api-key", icon: "🔑" },
  { label: "Widget & Embed", path: "widget", icon: "🔌" },
];

interface Props {
  projectId: string;
  projectName: string;
  projectInitial: string;
  projectColor: string;
}

export function ProjectSidebar({ projectId, projectName, projectInitial, projectColor }: Props) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <aside className="w-60 shrink-0">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
        ← All projects
      </Link>
      <div className="flex items-center gap-3 mb-5 px-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
          style={{ backgroundColor: projectColor }}
        >
          {projectInitial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{projectName}</p>
          <p className="text-xs text-slate-500">Project</p>
        </div>
      </div>
      <nav className="space-y-0.5">
        {ITEMS.map((item) => {
          const href = item.path ? `${base}/${item.path}` : base;
          const active = item.path
            ? pathname === href || pathname.startsWith(href + "/")
            : pathname === base;
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
