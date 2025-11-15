/**
 * Authentication Middleware
 * Verify JWT tokens and protect routes
 */

import { verifyToken, extractToken } from '../utils/auth.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authenticate request
 * Verifies JWT token and loads user data
 * @param {Request} request - Request object
 * @param {object} env - Environment bindings
 * @param {object} corsHeaders - CORS headers
 * @returns {Promise<object>} - { authenticated: boolean, user?: object, response?: Response }
 */
export async function authenticate(request, env, corsHeaders) {
  const token = extractToken(request);

  if (!token) {
    return {
      authenticated: false,
      response: errorResponse('Authorization token required', 401, null, corsHeaders)
    };
  }

  // Verify JWT
  const payload = await verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      response: errorResponse('Invalid or expired token', 401, null, corsHeaders)
    };
  }

  // Load user from database
  const user = await env.DB.prepare(
    'SELECT id, email, role, status FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user) {
    return {
      authenticated: false,
      response: errorResponse('User not found', 401, null, corsHeaders)
    };
  }

  if (user.status !== 'active') {
    return {
      authenticated: false,
      response: errorResponse('Account is suspended or banned', 403, null, corsHeaders)
    };
  }

  return {
    authenticated: true,
    user: user  // Return the user object from database, not the payload
  };
}

/**
 * Require authentication middleware
 * Returns error response if not authenticated
 * @param {Request} request - Request object
 * @param {object} env - Environment bindings
 * @param {object} corsHeaders - CORS headers
 * @returns {Promise<object|Response>} - User object or error Response
 */
export async function requireAuth(request, env, corsHeaders) {
  const authResult = await authenticate(request, env, corsHeaders);

  if (!authResult.authenticated) {
    return authResult.response;
  }

  return authResult.user;
}

/**
 * Require admin role middleware
 * Returns error response if not admin
 * @param {Request} request - Request object
 * @param {object} env - Environment bindings
 * @param {object} corsHeaders - CORS headers
 * @returns {Promise<object|Response>} - User object or error Response
 */
export async function requireAdmin(request, env, corsHeaders) {
  const user = await requireAuth(request, env, corsHeaders);

  // If user is a Response, it's an error response
  if (user instanceof Response) {
    return user;
  }

  if (user.role !== 'admin') {
    return errorResponse('Admin access required', 403, null, corsHeaders);
  }

  return user;
}

/**
 * Optional authentication middleware
 * Loads user if token is present, but doesn't require it
 * @param {Request} request - Request object
 * @param {object} env - Environment bindings
 * @returns {Promise<object|null>} - User object or null
 */
export async function optionalAuth(request, env) {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await env.DB.prepare(
    'SELECT id, email, role, status FROM users WHERE id = ?'
  ).bind(payload.userId).first();

  if (!user || user.status !== 'active') {
    return null;
  }

  return user;  // Return the user object from database, not the payload
}
