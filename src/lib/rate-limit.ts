interface Bucket {
  windowStart: number;
  count: number;
}

const buckets = new Map<string, Bucket>();

interface Options {
  key: string;
  limit: number;
  windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: Options): { ok: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now - b.windowStart >= windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { ok: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (b.count >= limit) {
    return { ok: false, remaining: 0, resetMs: windowMs - (now - b.windowStart) };
  }

  b.count += 1;
  return { ok: true, remaining: limit - b.count, resetMs: windowMs - (now - b.windowStart) };
}

// Light periodic cleanup to keep map bounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) {
      if (now - b.windowStart > 24 * 60 * 60 * 1000) buckets.delete(k);
    }
  }, 60 * 60 * 1000).unref?.();
}
