// Simple in-memory rate limiter
const rateLimit = 5; // requests per minute
const windowMs = 60 * 1000; // 1 minute

const requestCounts = new Map();

/**
 * Simple rate limiting middleware for Azure Functions
 * @param {Object} context - Azure Function context
 */
module.exports = async function rateLimitMiddleware(context) {
  const ip = context.req.headers['x-forwarded-for'] || context.req.ip || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  for (const [ip, { timestamp }] of requestCounts.entries()) {
    if (now - timestamp > windowMs) {
      requestCounts.delete(ip);
    }
  }

  // Get or initialize request count for this IP
  const requestInfo = requestCounts.get(ip) || { count: 0, timestamp: now };
  
  // Update request count
  requestInfo.count++;
  requestCounts.set(ip, requestInfo);

  // Check if rate limit exceeded
  if (requestInfo.count > rateLimit) {
    context.res = {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((windowMs - (now - requestInfo.timestamp)) / 1000),
        'X-RateLimit-Limit': rateLimit,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      },
      body: {
        error: 'Too many requests, please try again later.'
      }
    };
    context.done();
    throw new Error('Rate limit exceeded');
  }

  // Add rate limit headers to successful responses
  context.res = context.res || {};
  context.res.headers = {
    ...(context.res.headers || {}),
    'X-RateLimit-Limit': rateLimit,
    'X-RateLimit-Remaining': Math.max(0, rateLimit - requestInfo.count),
    'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
  };

  return true;
};
