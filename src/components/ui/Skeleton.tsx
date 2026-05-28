/** Shimmer placeholders for loading states. */

export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block rounded-md bg-sunk animate-pulse ${className}`} />;
}

/** A panel of N shimmering rows — matches the list-row layout. */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-line overflow-hidden" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Shimmering table body for tabular lists. */
export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="panel overflow-hidden" aria-hidden>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-5 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-3.5 ${c === 0 ? "w-32" : "flex-1 max-w-[8rem]"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
