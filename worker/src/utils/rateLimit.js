/**
 * Rate Limiting Utilities
 * Using Cloudflare KV for distributed rate limiting
 */

/**
 * Rate limiter configuration
 */
// More reasonable rate limits for production use
const RATE_LIMITS = {
  auth: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 15 // 15 attempts per 5 minutes (more reasonable)
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100 // 100 requests per minute
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200 // 200 requests per minute for admin
  }
};

/**
 * Get client identifier (IP address or user ID)
 * @param {Request} request - Request object
 * @param {number|null} userId - User ID if authenticated
 * @returns {string} - Client identifier
 */
function getClientIdentifier(request, userId = null) {
  if (userId) {
    return `user_${userId}`;
  }

  // Try to get IP from Cloudflare headers
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  const xRealIp = request.headers.get('X-Real-IP');

  return cfConnectingIp || xForwardedFor?.split(',')[0] || xRealIp || 'unknown';
}

/**
 * Check if request should be rate limited
 * @param {object} env - Environment bindings
 * @param {Request} request - Request object
 * @param {string} limitType - Type of rate limit (auth, api, admin)
 * @param {number|null} userId - User ID if authenticated
 * @returns {Promise<object>} - { allowed: boolean, remaining: number, resetAt: Date }
 */
export async function checkRateLimit(env, request, limitType = 'api', userId = null) {
  const config = RATE_LIMITS[limitType] || RATE_LIMITS.api;
  const clientId = getClientIdentifier(request, userId);
  const key = `ratelimit:${limitType}:${clientId}`;

  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get current count from KV
    const data = await env.CACHE.get(key, { type: 'json' });

    if (!data) {
      // First request in window
      await env.CACHE.put(key, JSON.stringify({
        count: 1,
        windowStart: now
      }), {
        expirationTtl: Math.ceil(config.windowMs / 1000)
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now + config.windowMs),
        limit: config.maxRequests
      };
    }

    // Check if we're still in the same window
    if (data.windowStart < windowStart) {
      // New window, reset count
      await env.CACHE.put(key, JSON.stringify({
        count: 1,
        windowStart: now
      }), {
        expirationTtl: Math.ceil(config.windowMs / 1000)
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now + config.windowMs),
        limit: config.maxRequests
      };
    }

    // Increment count
    const newCount = data.count + 1;

    if (newCount > config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(data.windowStart + config.windowMs),
        limit: config.maxRequests
      };
    }

    // Update count
    await env.CACHE.put(key, JSON.stringify({
      count: newCount,
      windowStart: data.windowStart
    }), {
      expirationTtl: Math.ceil((data.windowStart + config.windowMs - now) / 1000)
    });

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt: new Date(data.windowStart + config.windowMs),
      limit: config.maxRequests
    };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now + config.windowMs),
      limit: config.maxRequests
    };
  }
}

/**
 * Rate limit middleware - returns response if rate limited
 * @param {object} env - Environment bindings
 * @param {Request} request - Request object
 * @param {string} limitType - Type of rate limit
 * @param {number|null} userId - User ID if authenticated
 * @returns {Promise<Response|null>} - Response if rate limited, null otherwise
 */
export async function rateLimitMiddleware(env, request, limitType = 'api', userId = null) {
  const result = await checkRateLimit(env, request, limitType, userId);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);

    return new Response(JSON.stringify({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter,
      resetAt: result.resetAt.toISOString()
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toISOString()
      }
    });
  }

  return null; // Not rate limited, continue
}

/**
 * Add rate limit headers to response
 * @param {Response} response - Response object
 * @param {object} rateLimitInfo - Rate limit information
 * @returns {Response} - Response with rate limit headers
 */
export function addRateLimitHeaders(response, rateLimitInfo) {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt.toISOString());

  // Add CORS headers
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
