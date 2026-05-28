"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Settings2,
  BookOpen,
  MessageSquare,
  Contact,
  Users,
  KeyRound,
  Plug,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

const ITEMS: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "Overview", path: "", icon: LayoutGrid },
  { label: "Configuration", path: "config", icon: Settings2 },
  { label: "Knowledge Base", path: "knowledge", icon: BookOpen },
  { label: "Conversations", path: "conversations", icon: MessageSquare },
  { label: "Leads", path: "leads", icon: Contact },
  { label: "Team", path: "team", icon: Users },
  { label: "API Key", path: "api-key", icon: KeyRound },
  { label: "Widget & Embed", path: "widget", icon: Plug },
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
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-5"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
        All projects
      </Link>

      <div className="flex items-center gap-3 mb-6 px-1">
        <div
          className="size-10 rounded-xl flex items-center justify-center text-white font-semibold shrink-0 shadow-[0_1px_2px_oklch(0.4_0.05_60/0.25)]"
          style={{ backgroundColor: projectColor }}
        >
          {projectInitial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink text-sm truncate">{projectName}</p>
          <p className="text-xs text-faint">Workspace</p>
        </div>
      </div>

      <nav className="space-y-0.5">
        {ITEMS.map((item) => {
          const href = item.path ? `${base}/${item.path}` : base;
          const active = item.path
            ? pathname === href || pathname.startsWith(href + "/")
            : pathname === base;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-ember-soft text-ember-strong font-medium"
                  : "text-muted hover:text-ink hover:bg-sunk"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-ember" />
              )}
              <Icon
                className={`size-[1.05rem] shrink-0 ${active ? "text-ember" : "text-faint group-hover:text-muted"}`}
                strokeWidth={active ? 2 : 1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
