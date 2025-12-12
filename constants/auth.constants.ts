/**
 * Authentication Module Constants
 * 
 * All configuration and constants for the authentication system.
 */

// Token Configuration
export const TOKEN_CONFIG = {
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    TOKEN_TYPE: {
        ACCESS: 'access',
        REFRESH: 'refresh',
    },
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
    BCRYPT_SALT_ROUNDS: 12,
    PASSWORD_MIN_LENGTH: 8,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
} as const;

// Error Messages
export const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Authentication required',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_MISSING: 'No token provided',
    TOKEN_REVOKED: 'Token has been revoked',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
} as const;

// Success Messages
export const AUTH_SUCCESS = {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    USER_CREATED: 'User created successfully',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^.{8,}$/,
} as const;
