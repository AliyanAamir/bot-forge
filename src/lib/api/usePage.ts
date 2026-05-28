"use client";

import { useSearchParams } from "next/navigation";

/** Read the current `?page` as a 1-based integer. Single source of truth. */
export function usePageParam(): number {
  const sp = useSearchParams();
  const raw = Number.parseInt(sp.get("page") ?? "1", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}
