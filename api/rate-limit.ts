/**
 * Simple in-memory rate limiter for Vercel serverless functions
 * Limits requests per IP address
 * 
 * Note: In a production environment with multiple instances,
 * consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (cleared on function cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes (approximate, based on function invocations)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

/**
 * Get client IP from Vercel request
 */
function getClientIP(req: any): string {
  // Vercel provides these headers
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback (shouldn't happen in Vercel)
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Check rate limit for an IP address
 * @param req - Vercel request object
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  req: any,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();
  
  const ip = getClientIP(req);
  const now = Date.now();
  
  let entry = rateLimitStore.get(ip);
  
  // Create new entry or reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(ip, entry);
  }
  
  entry.count++;
  
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

