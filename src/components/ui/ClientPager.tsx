"use client";

import { useSearchParams } from "next/navigation";
import { Pager } from "./Pager";

/**
 * Client wrapper around the server <Pager>. Reads the current querystring
 * via useSearchParams so it composes inside useQuery-driven lists while
 * keeping ?page in the URL (shareable + back-button friendly).
 */
export function ClientPager({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  noun,
  busy,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath: string;
  noun?: string;
  busy?: boolean;
}) {
  const sp = useSearchParams();
  const record: Record<string, string> = {};
  sp.forEach((v, k) => {
    record[k] = v;
  });

  return (
    <div className={busy ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <Pager
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        basePath={basePath}
        searchParams={record}
        noun={noun}
      />
    </div>
  );
}
