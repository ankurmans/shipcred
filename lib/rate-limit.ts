/**
 * Simple in-memory rate limiter using sliding window.
 *
 * For Vercel serverless: this rate limits per-instance only.
 * For production at scale, replace with Upstash @upstash/ratelimit.
 * This still provides protection against burst abuse within a single instance.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs * 2;
  for (const [key, entry] of store) {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs?: number;
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.max) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      success: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    remaining: config.max - entry.timestamps.length,
  };
}

/** Helper to get a rate limit key from a Next.js request */
export function getRateLimitKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `${prefix}:${ip}`;
}

/** Helper to get a user-scoped rate limit key */
export function getUserRateLimitKey(userId: string, prefix: string): string {
  return `${prefix}:user:${userId}`;
}
