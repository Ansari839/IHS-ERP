/**
 * Authentication Middleware
 * 
 * Protects API routes by verifying JWT access tokens.
 */

import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { AUTH_ERRORS } from '@/constants';
import type { AuthMiddlewareResult } from '@/types/auth.types';

/**
 * Authenticate middleware for Next.js API routes
 */
export async function authenticate(req: NextRequest): Promise<AuthMiddlewareResult> {
    try {
        // Extract Authorization header
        const authHeader = req.headers.get('authorization');

        if (!authHeader) {
            return {
                authenticated: false,
                error: {
                    success: false,
                    error: { message: AUTH_ERRORS.TOKEN_MISSING },
                },
            };
        }

        // Check for Bearer token format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return {
                authenticated: false,
                error: {
                    success: false,
                    error: { message: AUTH_ERRORS.TOKEN_INVALID },
                },
            };
        }

        const token = parts[1];

        // Verify token
        const decoded = verifyAccessToken(token);

        // Return authenticated result with user data
        return {
            authenticated: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
            },
        };
    } catch (error) {
        // Token verification failed
        return {
            authenticated: false,
            error: {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : AUTH_ERRORS.TOKEN_INVALID
                },
            },
        };
    }
}

/**
 * Extract user from request without failing
 * Useful for routes that work both authenticated and unauthenticated
 */
export async function getOptionalUser(req: NextRequest) {
    const result = await authenticate(req);
    return result.authenticated ? result.user : null;
}
