/**
 * Rate limit: in-memory (per instance) + optional Redis for cross-instance counts.
 */

import { kvGet, kvSet } from './kv';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

/** Prefer Redis when available so Vercel instances share a budget. */
export async function checkRateLimitAsync(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const redisKey = `rc:rl:${key}`;
  const now = Date.now();
  try {
    const raw = await kvGet(redisKey);
    let entry: { count: number; resetAt: number } | null = null;
    if (raw) {
      try {
        entry = JSON.parse(raw) as { count: number; resetAt: number };
      } catch {
        entry = null;
      }
    }
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      await kvSet(redisKey, JSON.stringify(entry));
      // Keep memory in sync for same-instance bursts
      buckets.set(key, entry);
      return { allowed: true };
    }
    if (entry.count >= max) {
      return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count += 1;
    await kvSet(redisKey, JSON.stringify(entry));
    buckets.set(key, entry);
    return { allowed: true };
  } catch {
    return checkRateLimit(key, max, windowMs);
  }
}

export function clientIp(req: { headers?: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() ?? 'unknown';
  if (Array.isArray(forwarded)) return forwarded[0] ?? 'unknown';
  return 'unknown';
}
