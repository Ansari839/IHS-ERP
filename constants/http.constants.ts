/**
 * HTTP Constants
 * 
 * Standard HTTP status codes and common error messages.
 */

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// Common Error Messages
export const ERROR_MESSAGES = {
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Password must be at least 8 characters',
    MISSING_FIELDS: 'Missing required fields',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database operation failed',
} as const;

// Database Configuration
export const DB_CONFIG = {
    TOKEN_CLEANUP_INTERVAL_HOURS: 24,
    MAX_REFRESH_TOKENS_PER_USER: 5,
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
