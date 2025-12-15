/**
 * JWT Utility Functions
 * 
 * Handles generation and verification of JWT access and refresh tokens.
 * Uses separate secrets for access and refresh tokens for enhanced security.
 */

import jwt from 'jsonwebtoken';
import { TOKEN_CONFIG, SECURITY_CONFIG, AUTH_ERRORS } from '@/constants';
import type { TokenPayload } from '@/types/auth.types';

/**
 * Generate a short-lived access token
 */
export function generateAccessToken(
    payload: Omit<TokenPayload, 'type'>,
    expiresIn: string = TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY
): string {
    if (!SECURITY_CONFIG.ACCESS_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET is not configured');
    }

    return jwt.sign(
        {
            ...payload,
            type: TOKEN_CONFIG.TOKEN_TYPE.ACCESS,
        },
        SECURITY_CONFIG.ACCESS_TOKEN_SECRET,
        {
            expiresIn: expiresIn as any, // Cast to avoid overload confusion
            issuer: 'erp-auth-system',
            audience: 'erp-client',
        }
    );
}

/**
 * Generate a long-lived refresh token
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
    if (!SECURITY_CONFIG.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET is not configured');
    }

    return jwt.sign(
        {
            ...payload,
            type: TOKEN_CONFIG.TOKEN_TYPE.REFRESH,
            jti: crypto.randomUUID(), // Ensure uniqueness even within same second
        },
        SECURITY_CONFIG.REFRESH_TOKEN_SECRET,
        {
            expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
            issuer: 'erp-auth-system',
            audience: 'erp-client',
        }
    );
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
    if (!SECURITY_CONFIG.ACCESS_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET is not configured');
    }

    try {
        const decoded = jwt.verify(token, SECURITY_CONFIG.ACCESS_TOKEN_SECRET, {
            issuer: 'erp-auth-system',
            audience: 'erp-client',
        }) as TokenPayload;

        if (decoded.type !== TOKEN_CONFIG.TOKEN_TYPE.ACCESS) {
            throw new Error(AUTH_ERRORS.TOKEN_INVALID);
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error(AUTH_ERRORS.TOKEN_EXPIRED);
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error(AUTH_ERRORS.TOKEN_INVALID);
        }
        throw error;
    }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
    if (!SECURITY_CONFIG.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET is not configured');
    }

    try {
        const decoded = jwt.verify(token, SECURITY_CONFIG.REFRESH_TOKEN_SECRET, {
            issuer: 'erp-auth-system',
            audience: 'erp-client',
        }) as TokenPayload;

        if (decoded.type !== TOKEN_CONFIG.TOKEN_TYPE.REFRESH) {
            throw new Error(AUTH_ERRORS.TOKEN_INVALID);
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error(AUTH_ERRORS.TOKEN_EXPIRED);
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error(AUTH_ERRORS.TOKEN_INVALID);
        }
        throw error;
    }
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
    const decoded = jwt.decode(token) as TokenPayload | null;
    if (!decoded || !decoded.exp) {
        return null;
    }
    return new Date(decoded.exp * 1000);
}
