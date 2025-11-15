/**
 * Input Validation Utilities
 * Using Zod for schema validation
 */

import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
});

export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional()
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// ============================================================================
// PREDICTION SCHEMAS
// ============================================================================

export const createPredictionSchema = z.object({
  matchId: z.number().int().positive(),
  predictionTypeId: z.number().int().positive(),
  predictionValue: z.string().min(1).max(100),
  confidence: z.number().min(0).max(100).optional(),
  stake: z.number().positive().optional(),
  odds: z.number().positive().optional(),
  isPublic: z.boolean().default(false)
});

// ============================================================================
// BET SCHEMAS
// ============================================================================

export const createBetSchema = z.object({
  matchId: z.number().int().positive(),
  bookmakerId: z.number().int().positive().optional(),
  betType: z.enum(['single', 'accumulator', 'system']),
  predictionType: z.string().min(1),
  selection: z.string().min(1),
  stake: z.number().positive(),
  odds: z.number().positive(),
  notes: z.string().max(500).optional()
});

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0)
});

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

// ============================================================================
// VALIDATION HELPER
// ============================================================================

/**
 * Validate data against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {object} - { success: boolean, data?: any, errors?: array }
 */
export function validate(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return { success: false, errors: [{ message: 'Validation failed' }] };
  }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 * @param {object} data - Input data
 * @param {Array<string>} fields - Fields to sanitize
 * @returns {object} - Sanitized data
 */
export function sanitizeInput(data, fields = []) {
  const sanitized = { ...data };

  for (const field of fields) {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeHtml(sanitized[field]);
    }
  }

  return sanitized;
}
