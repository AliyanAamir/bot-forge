/**
 * Offset pagination helpers shared by list APIs and server-component pages.
 *
 * APIs return: { data, page, pageSize, total, totalPages }
 * Pages read ?page= / ?pageSize= and render a <Pager />.
 */

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function toInt(value: string | undefined): number | null {
  if (value == null) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

/** Core parser. `get` returns a single string value (or undefined) for a key. */
function read(get: (key: string) => string | undefined, defaultPageSize: number): Pagination {
  const page = Math.max(1, toInt(get("page")) ?? 1);
  const rawSize = toInt(get("pageSize")) ?? defaultPageSize;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** For API routes: `req.nextUrl.searchParams`. */
export function paginationFromSearchParams(
  sp: URLSearchParams,
  defaultPageSize: number = DEFAULT_PAGE_SIZE,
): Pagination {
  return read((k) => sp.get(k) ?? undefined, defaultPageSize);
}

/** For server-component pages: the awaited `searchParams` record. */
export function paginationFromRecord(
  rec: Record<string, string | string[] | undefined>,
  defaultPageSize: number = DEFAULT_PAGE_SIZE,
): Pagination {
  return read((k) => {
    const v = rec[k];
    return Array.isArray(v) ? v[0] : v;
  }, defaultPageSize);
}

/** Wrap rows + total count into the standard response envelope. */
export function paginate<T>(data: T[], total: number, p: Pagination): Paginated<T> {
  return {
    data,
    page: p.page,
    pageSize: p.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / p.pageSize)),
  };
}
