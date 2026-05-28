import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Server-rendered offset pager. Builds hrefs from a base path + current
 * searchParams, swapping only `page`. Use on any paginated list page.
 */
export function Pager({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  searchParams,
  noun = "items",
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath: string;
  searchParams?: Record<string, string | string[] | undefined>;
  noun?: string;
}) {
  if (total === 0) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams ?? {})) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
      else if (v != null) sp.set(k, v);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const windowPages = pageWindow(page, totalPages);

  return (
    <nav className="flex items-center justify-between gap-4 pt-4" aria-label="Pagination">
      <p className="text-xs text-muted tabular-nums">
        {from}–{to} of <span className="text-ink font-medium">{total}</span> {noun}
      </p>

      <div className="flex items-center gap-1">
        <PagerArrow href={href(page - 1)} disabled={page <= 1} dir="prev" />
        {windowPages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-faint text-sm select-none">
              …
            </span>
          ) : (
            <PageLink key={p} href={href(p)} page={p} active={p === page} />
          ),
        )}
        <PagerArrow href={href(page + 1)} disabled={page >= totalPages} dir="next" />
      </div>
    </nav>
  );
}

function PageLink({ href, page, active }: { href: string; page: number; active: boolean }) {
  if (active) {
    return (
      <span
        aria-current="page"
        className="inline-flex min-w-8 h-8 items-center justify-center rounded-md px-2 text-sm font-medium bg-ember text-white tabular-nums"
      >
        {page}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-w-8 h-8 items-center justify-center rounded-md px-2 text-sm font-medium text-muted hover:text-ink hover:bg-sunk transition-colors tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ember/35"
    >
      {page}
    </Link>
  );
}

function PagerArrow({ href, disabled, dir }: { href: string; disabled: boolean; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  const label = dir === "prev" ? "Previous page" : "Next page";
  if (disabled) {
    return (
      <span aria-disabled className="inline-flex size-8 items-center justify-center rounded-md text-faint/50 cursor-not-allowed">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:text-ink hover:bg-sunk transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ember/35"
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </Link>
  );
}

/** Compact page list with ellipses: 1 … 4 [5] 6 … 20 */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);

  return pages;
}
