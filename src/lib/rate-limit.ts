// Simple in-memory rate limiter (sliding window) for API routes.
// Consistent with the app's in-memory storage model (see src/lib/db.ts).
// Note: in a serverless deployment each invocation gets a fresh instance,
// so this is a best-effort guard, not a distributed rate limiter.

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically prune stale entries to avoid unbounded memory growth.
const MAX_ENTRIES = 5000;
let lastPrune = Date.now();

function prune(now: number) {
  if (buckets.size < MAX_ENTRIES) return;
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > 10 * 60_000) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check (and increment) a rate-limit bucket for the given key.
 * @param key - unique identifier (e.g. IP address or userId + route)
 * @param limit - max requests allowed per window
 * @param windowMs - window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const elapsedMs = now - bucket.windowStart;
    const retryAfterMs = Math.max(1000, windowMs - elapsedMs);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

/** Extract a stable client identifier from a request (IP + route). */
export function clientKey(request: Request, route: string): string {
  const ip =
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `${route}:${ip}`;
}
