// A simple in-memory rate limiter
// For a multi-node production environment, you should replace this with Redis (e.g., @upstash/ratelimit)

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitCache = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitCache.entries()) {
    if (now > record.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}
