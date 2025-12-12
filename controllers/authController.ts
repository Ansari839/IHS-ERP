/**
 * Authentication Controller
 * 
 * Business logic for authentication operations.
 * Clean separation: No HTTP handling, pure business logic.
 */

import { PrismaClient } from '@/app/generated/prisma';
import { hashPassword, comparePassword } from '@/lib/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/jwt';
import { validateLoginInput, validateRefreshInput, sanitizeEmail } from '@/lib/validation';
import { AUTH_ERRORS, AUTH_SUCCESS, TOKEN_CONFIG } from '@/constants';
import type {
    ControllerResponse,
    LoginResponse,
    RefreshResponse,
    User,
} from '@/types/auth.types';

const prisma = new PrismaClient();

// ============================================
// DEMO USER (In-Memory) - Remove for Production
// ============================================
const DEMO_USER = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.7gJ8qK9Y7xG', // password123
};

const refreshTokenStore = new Map<string, {
    userId: number;
    expiresAt: Date;
    isRevoked: boolean;
}>();

// ============================================
// Helper Functions
// ============================================

function calculateExpiryDate(expiryString: string): Date {
    const match = expiryString.match(/^(\d+)([dhmsDHMS])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
}

// ============================================
// Authentication Operations
// ============================================

/**
 * Login user and generate tokens
 */
export async function login(
    email: string,
    password: string
): Promise<ControllerResponse<LoginResponse>> {
    try {
        // Validate input
        const validation = validateLoginInput({ email, password });
        if (!validation.isValid) {
            return {
                success: false,
                error: AUTH_ERRORS.INVALID_CREDENTIALS,
                validationErrors: validation.errors,
            };
        }

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email);

        // ========== IN-MEMORY DEMO ==========
        let user = null;
        if (sanitizedEmail === DEMO_USER.email) {
            user = DEMO_USER;
        }

        /* PRODUCTION CODE (Prisma):
        const user = await prisma.user.findUnique({
          where: { email: sanitizedEmail },
        });
        */
        // ====================================

        if (!user) {
            return {
                success: false,
                error: AUTH_ERRORS.INVALID_CREDENTIALS,
            };
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                error: AUTH_ERRORS.INVALID_CREDENTIALS,
            };
        }

        // Generate tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        const expiresAt = calculateExpiryDate(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY);

        // ========== IN-MEMORY DEMO ==========
        refreshTokenStore.set(refreshToken, {
            userId: user.id,
            expiresAt,
            isRevoked: false,
        });

        /* PRODUCTION CODE (Prisma):
        await prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
          },
        });
        */
        // ====================================

        return {
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            message: AUTH_SUCCESS.LOGIN_SUCCESS,
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Internal server error',
        };
    }
}

/**
 * Refresh access token
 */
export async function refresh(
    refreshToken: string
): Promise<ControllerResponse<RefreshResponse>> {
    try {
        // Validate input
        const validation = validateRefreshInput({ refreshToken });
        if (!validation.isValid) {
            return {
                success: false,
                error: AUTH_ERRORS.TOKEN_INVALID,
                validationErrors: validation.errors,
            };
        }

        // Verify JWT signature
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : AUTH_ERRORS.TOKEN_INVALID,
            };
        }

        // ========== IN-MEMORY DEMO ==========
        const tokenData = refreshTokenStore.get(refreshToken);

        /* PRODUCTION CODE (Prisma):
        const tokenData = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
        });
        */
        // ====================================

        if (!tokenData) {
            return {
                success: false,
                error: AUTH_ERRORS.TOKEN_INVALID,
            };
        }

        if (tokenData.isRevoked) {
            return {
                success: false,
                error: AUTH_ERRORS.TOKEN_REVOKED,
            };
        }

        if (new Date() > tokenData.expiresAt) {
            return {
                success: false,
                error: AUTH_ERRORS.TOKEN_EXPIRED,
            };
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
        });

        return {
            success: true,
            data: {
                accessToken: newAccessToken,
            },
            message: AUTH_SUCCESS.TOKEN_REFRESHED,
        };
    } catch (error) {
        console.error('Refresh error:', error);
        return {
            success: false,
            error: 'Internal server error',
        };
    }
}

/**
 * Logout user by revoking refresh token
 */
export async function logout(refreshToken: string): Promise<ControllerResponse<{ message: string }>> {
    try {
        // Validate input
        const validation = validateRefreshInput({ refreshToken });
        if (!validation.isValid) {
            return {
                success: false,
                error: AUTH_ERRORS.TOKEN_INVALID,
                validationErrors: validation.errors,
            };
        }

        // ========== IN-MEMORY DEMO ==========
        refreshTokenStore.delete(refreshToken);

        /* PRODUCTION CODE (Prisma):
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
        */
        // ====================================

        return {
            success: true,
            data: { message: AUTH_SUCCESS.LOGOUT_SUCCESS },
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            error: 'Internal server error',
        };
    }
}
