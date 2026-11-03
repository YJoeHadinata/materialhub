import { AppError } from "./api-response";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export function enforceRateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60_000,
): void {
  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || existing.resetAt <= now) {
    buckets.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  existing.count += 1;
  if (existing.count > maxRequests) {
    throw new AppError(
      "RATE_LIMIT_EXCEEDED",
      "Too many requests. Please wait before trying again.",
      429,
    );
  }
}

export function resetRateLimitsForTesting(): void {
  buckets.clear();
}
