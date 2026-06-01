/**
 * Validates a request Origin against the project's allowedDomains list.
 *
 * Returns the value to use for Access-Control-Allow-Origin:
 *   - "*"               when no restrictions are configured
 *   - the matched origin when the request origin is on the allowlist
 *   - null              when the origin is blocked
 */
export function getAllowedOrigin(
  allowedDomains: string | null | undefined,
  requestOrigin: string | null | undefined
): string | null {
  const list = (allowedDomains ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (list.length === 0) return "*";

  const origin = (requestOrigin ?? "").replace(/\/$/, ""); // normalise trailing slash
  if (!origin) return null;

  const matched = list.some((d) => origin === d.replace(/\/$/, ""));
  return matched ? origin : null;
}
