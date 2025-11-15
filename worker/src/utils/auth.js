/**
 * Authentication Utilities
 * Handles JWT generation, verification, and password hashing
 */

import bcrypt from 'bcryptjs';
import * as jose from 'jose';

// JWT Secret - For production, add to wrangler.toml [secrets]
// In Workers, we can't use process.env - secrets come from env bindings
const JWT_SECRET = new TextEncoder().encode(
  'your-super-secret-jwt-key-change-in-production-min-32-chars-footyfortunes'
);

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 * @param {object} user - User object
 * @returns {Promise<string>} - JWT token
 */
export async function generateAccessToken(user) {
  const token = await new jose.SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('footyfortunes-api')
    .setAudience('footyfortunes-web')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generate JWT refresh token
 * @param {object} user - User object
 * @returns {Promise<string>} - JWT refresh token
 */
export async function generateRefreshToken(user) {
  const token = await new jose.SignJWT({
    userId: user.id,
    email: user.email,
    type: 'refresh'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('footyfortunes-api')
    .setAudience('footyfortunes-web')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<object|null>} - Decoded payload or null
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: 'footyfortunes-api',
      audience: 'footyfortunes-web'
    });
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Generate a unique session ID
 * @returns {string} - Session ID
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Request object
 * @returns {string|null} - Token or null
 */
export function extractToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
