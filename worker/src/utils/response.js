/**
 * Response Utilities
 * Standardized API responses
 */

/**
 * Create JSON response
 * @param {object} data - Response data
 * @param {number} status - HTTP status code
 * @param {object} headers - Additional headers
 * @returns {Response} - Response object
 */
export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

/**
 * Success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {object} headers - Additional headers
 * @returns {Response} - Response object
 */
export function successResponse(data, message = null, headers = {}) {
  return jsonResponse({
    success: true,
    ...(message && { message }),
    ...data
  }, 200, headers);
}

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object} details - Additional error details
 * @param {object} headers - Additional headers
 * @returns {Response} - Response object
 */
export function errorResponse(message, status = 500, details = null, headers = {}) {
  return jsonResponse({
    success: false,
    error: message,
    ...(details && { details })
  }, status, headers);
}

/**
 * Validation error response
 * @param {Array} errors - Validation errors
 * @param {object} headers - Additional headers
 * @returns {Response} - Response object
 */
export function validationErrorResponse(errors, headers = {}) {
  return jsonResponse({
    success: false,
    error: 'Validation failed',
    validationErrors: errors
  }, 400, headers);
}

/**
 * CORS headers
 * @param {string} origin - Allowed origin (default: *)
 * @returns {object} - CORS headers
 */
export function getCorsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': origin !== '*' ? 'true' : 'false'
  };
}

/**
 * Handle CORS preflight
 * @param {object} corsHeaders - CORS headers
 * @returns {Response} - Response object
 */
export function corsPreflightResponse(corsHeaders) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
