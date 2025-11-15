/**
 * Authentication Handlers
 * Secure auth endpoints with bcrypt, JWT, validation, and rate limiting
 */

import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateSessionId
} from '../utils/auth.js';
import { validate, loginSchema, registerSchema, refreshTokenSchema } from '../utils/validation.js';
import { rateLimitMiddleware } from '../utils/rateLimit.js';
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.js';

/**
 * Handle user login
 * POST /api/auth/login
 */
export async function handleLogin(request, env, corsHeaders) {
  // Rate limiting
  const rateLimitResponse = await rateLimitMiddleware(env, request, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, role, status FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      // Generic error to prevent user enumeration
      return errorResponse('Invalid credentials', 401, null, corsHeaders);
    }

    // Check user status
    if (user.status !== 'active') {
      return errorResponse('Account is suspended or banned', 403, null, corsHeaders);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401, null, corsHeaders);
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    const sessionId = generateSessionId();

    // Store session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, refresh_token, access_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      user.id,
      refreshToken,
      accessToken,
      expiresAt,
      request.headers.get('CF-Connecting-IP') || 'unknown',
      request.headers.get('User-Agent') || 'unknown'
    ).run();

    // Update last login
    await env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE id = ?'
    ).bind(new Date().toISOString(), user.id).run();

    return successResponse({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }, 'Login successful', corsHeaders);

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500, null, corsHeaders);
  }
}

/**
 * Handle user registration
 * POST /api/auth/register
 */
export async function handleRegister(request, env, corsHeaders) {
  // Rate limiting
  const rateLimitResponse = await rateLimitMiddleware(env, request, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validate(registerSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { email, password, username, fullName } = validation.data;

    // Check if email already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return errorResponse('Email already registered', 409, null, corsHeaders);
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await env.DB.prepare(
        'SELECT id FROM users WHERE username = ?'
      ).bind(username).first();

      if (existingUsername) {
        return errorResponse('Username already taken', 409, null, corsHeaders);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await env.DB.prepare(`
      INSERT INTO users (email, password_hash, username, full_name, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      email,
      passwordHash,
      username || null,
      fullName || null,
      'user',
      'active',
      new Date().toISOString()
    ).run();

    const userId = result.meta.last_row_id;

    // Create user profile
    await env.DB.prepare(`
      INSERT INTO user_profiles (user_id) VALUES (?)
    `).bind(userId).run();

    // Create user settings
    await env.DB.prepare(`
      INSERT INTO user_settings (user_id) VALUES (?)
    `).bind(userId).run();

    // Create user stats
    await env.DB.prepare(`
      INSERT INTO user_stats (user_id) VALUES (?)
    `).bind(userId).run();

    // Create user betting stats (Phase 2)
    await env.DB.prepare(`
      INSERT INTO user_betting_stats (user_id, starting_bankroll, current_bankroll) 
      VALUES (?, 10000, 10000)
    `).bind(userId).run();

    // Create user level (Phase 2)
    await env.DB.prepare(`
      INSERT INTO user_levels (user_id, level, current_xp) 
      VALUES (?, 1, 0)
    `).bind(userId).run();

    const user = { id: userId, email, role: 'user' };

    // Generate tokens
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    const sessionId = generateSessionId();

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, refresh_token, access_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      userId,
      refreshToken,
      accessToken,
      expiresAt,
      request.headers.get('CF-Connecting-IP') || 'unknown',
      request.headers.get('User-Agent') || 'unknown'
    ).run();

    return successResponse({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        role: 'user'
      }
    }, 'Registration successful', corsHeaders);

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed', 500, null, corsHeaders);
  }
}

/**
 * Handle token refresh
 * POST /api/auth/refresh
 */
export async function handleRefreshToken(request, env, corsHeaders) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validate(refreshTokenSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { refreshToken } = validation.data;

    // Verify refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return errorResponse('Invalid refresh token', 401, null, corsHeaders);
    }

    // Check if session exists and is valid
    const session = await env.DB.prepare(
      'SELECT id, user_id, expires_at FROM user_sessions WHERE refresh_token = ?'
    ).bind(refreshToken).first();

    if (!session) {
      return errorResponse('Session not found', 401, null, corsHeaders);
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await env.DB.prepare(
        'DELETE FROM user_sessions WHERE id = ?'
      ).bind(session.id).run();

      return errorResponse('Session expired', 401, null, corsHeaders);
    }

    // Get user
    const user = await env.DB.prepare(
      'SELECT id, email, role, status FROM users WHERE id = ?'
    ).bind(session.user_id).first();

    if (!user || user.status !== 'active') {
      return errorResponse('User not found or inactive', 401, null, corsHeaders);
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken(user);

    // Update session with new access token
    await env.DB.prepare(`
      UPDATE user_sessions
      SET access_token = ?, last_accessed = ?
      WHERE id = ?
    `).bind(newAccessToken, new Date().toISOString(), session.id).run();

    return successResponse({
      accessToken: newAccessToken
    }, 'Token refreshed successfully', corsHeaders);

  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('Token refresh failed', 500, null, corsHeaders);
  }
}

/**
 * Handle logout
 * POST /api/auth/logout
 */
export async function handleLogout(request, env, corsHeaders, user) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (refreshToken) {
      // Delete specific session
      await env.DB.prepare(
        'DELETE FROM user_sessions WHERE user_id = ? AND refresh_token = ?'
      ).bind(user.userId, refreshToken).run();
    } else {
      // Delete all sessions for user
      await env.DB.prepare(
        'DELETE FROM user_sessions WHERE user_id = ?'
      ).bind(user.userId).run();
    }

    return successResponse({}, 'Logout successful', corsHeaders);

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Logout failed', 500, null, corsHeaders);
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function handleGetMe(env, corsHeaders, user) {
  try {
    console.log('Get me called for user:', user);

    const userInfo = await env.DB.prepare(`
      SELECT
        u.id, u.email, u.username, u.full_name, u.avatar_url, u.role, u.status, u.created_at,
        p.bio, p.location,
        l.current_level, l.current_xp, l.total_xp,
        bs.current_bankroll, bs.net_profit, bs.roi_percentage, bs.win_rate, bs.current_win_streak
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN user_levels l ON u.id = l.user_id
      LEFT JOIN user_betting_stats bs ON u.id = bs.user_id
      WHERE u.id = ?
    `).bind(user.id).first();

    console.log('User info fetched:', userInfo ? 'found' : 'not found');

    if (!userInfo) {
      return errorResponse('User not found', 404, null, corsHeaders);
    }

    return successResponse({ user: userInfo }, null, corsHeaders);

  } catch (error) {
    console.error('Get user info error:', error);
    console.error('Error message:', error.message);
    console.error('User object:', user);
    return errorResponse(`Failed to fetch user info: ${error.message}`, 500, null, corsHeaders);
  }
}
