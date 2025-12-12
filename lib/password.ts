/**
 * Password Utility Functions
 * 
 * Handles password hashing and comparison using bcrypt.
 */

import bcrypt from 'bcrypt';
import { SECURITY_CONFIG, ERROR_MESSAGES } from '@/constants';
import type { ValidationResult } from '@/types/auth.types';

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(SECURITY_CONFIG.BCRYPT_SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw new Error('Failed to compare passwords');
    }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
        errors.push('Password is required');
        return { isValid: false, error: errors[0] };
    }

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
        errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
    }

    // Additional requirements can be added here
    // - At least one uppercase letter
    // - At least one number
    // - At least one special character

    return {
        isValid: errors.length === 0,
        error: errors[0],
    };
}
