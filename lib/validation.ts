/**
 * Input Validation Utilities
 * 
 * Validates user input for authentication endpoints.
 */

import { VALIDATION_PATTERNS, ERROR_MESSAGES, SECURITY_CONFIG, AUTH_ERRORS } from '@/constants';
import type { ValidationResult, LoginRequest, RefreshRequest } from '@/types/auth.types';

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }

    if (typeof email !== 'string') {
        return { isValid: false, error: 'Email must be a string' };
    }

    if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
    }

    return { isValid: true };
}

/**
 * Validate password format
 */
export function validatePassword(password: string): ValidationResult {
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }

    if (typeof password !== 'string') {
        return { isValid: false, error: 'Password must be a string' };
    }

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_PASSWORD };
    }

    return { isValid: true };
}

/**
 * Validate refresh token format
 */
export function validateRefreshToken(token: string): ValidationResult {
    if (!token) {
        return { isValid: false, error: AUTH_ERRORS.TOKEN_MISSING };
    }

    if (typeof token !== 'string') {
        return { isValid: false, error: AUTH_ERRORS.TOKEN_INVALID };
    }

    // Basic JWT format check (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
        return { isValid: false, error: AUTH_ERRORS.TOKEN_INVALID };
    }

    return { isValid: true };
}

/**
 * Validate login request data
 */
export function validateLoginInput(data: LoginRequest): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.MISSING_FIELDS,
        };
    }

    // Validate email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
        errors.email = emailValidation.error!;
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error!;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Validate refresh token request data
 */
export function validateRefreshInput(data: RefreshRequest): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.MISSING_FIELDS,
        };
    }

    // Validate refresh token
    const tokenValidation = validateRefreshToken(data.refreshToken);
    if (!tokenValidation.isValid) {
        errors.refreshToken = tokenValidation.error!;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Sanitize email (trim and lowercase)
 */
export function sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

/**
 * Sanitize string input (trim whitespace)
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input.trim();
}
