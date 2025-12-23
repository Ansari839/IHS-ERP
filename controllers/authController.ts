/**
 * Authentication Controller
 * 
 * Business logic for authentication operations.
 * Clean separation: No HTTP handling, pure business logic.
 */

import prisma from '@/lib/prisma';
import { hashPassword, comparePassword } from '@/lib/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from '@/lib/jwt';
import { validateLoginInput, validateRefreshInput, sanitizeEmail } from '@/lib/validation';
import { AUTH_ERRORS, AUTH_SUCCESS, TOKEN_CONFIG } from '@/constants';
import type {
    ControllerResponse,
    LoginResponse,
    RefreshResponse,
    User,
} from '@/types/auth.types';


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

        // Fetch user from database with roles and permissions
        const user = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

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

        // Check if password change is required
        // @ts-ignore - forcePasswordChange exists after migration
        // Check if user is active
        // @ts-ignore - isActive is a new field
        if (user.isActive === false) {
            return {
                success: false,
                error: 'Your account has been deactivated. Please contact the administrator.',
            };
        }

        // Check if password change is required
        if (user.forcePasswordChange) {
            // Generate temporary token for password change (10 minutes)
            const tempToken = generateAccessToken({
                id: user.id,
                email: user.email,
                name: user.name,
                // type is added by generateAccessToken
                permissions: ['AUTH:PASSWORD_CHANGE'], // Special permission
            }, '10m');

            return {
                success: true,
                data: {
                    requirePasswordChange: true,
                    userId: user.id,
                    tempToken,
                },
                message: 'Password change required',
            };
        }

        // Flatten roles and permissions
        const roles = user.userRoles.map((ur: any) => ur.role.name);
        const permissions = Array.from(new Set(
            user.userRoles.flatMap((ur: any) =>
                ur.role.permissions.map((rp: any) =>
                    `${rp.permission.action}:${rp.permission.resource}`
                )
            )
        )) as string[];

        // Generate tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles,
            permissions,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        const expiresAt = calculateExpiryDate(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY);

        // Store refresh token in database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    roles,
                    permissions,
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

        // Check refresh token in database
        const tokenData = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

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

        // Fetch user to get latest roles and permissions
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return {
                success: false,
                error: AUTH_ERRORS.USER_NOT_FOUND,
            };
        }

        // Flatten roles and permissions
        const roles = user.userRoles.map((ur: any) => ur.role.name);
        const permissions = Array.from(new Set(
            user.userRoles.flatMap((ur: any) =>
                ur.role.permissions.map((rp: any) =>
                    `${rp.permission.action}:${rp.permission.resource}`
                )
            )
        )) as string[];

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles,
            permissions,
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

        // Delete refresh token from database
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });

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

/**
 * Change password for first-time login
 */
export async function changePassword(
    tempToken: string,
    newPassword: string
): Promise<ControllerResponse<LoginResponse>> {
    try {
        // Verify temp token
        let decoded;
        try {
            // We use verifyAccessToken because tempToken is signed with ACCESS_TOKEN_SECRET
            // (see login function where we used generateAccessToken)
            decoded = verifyAccessToken(tempToken);
        } catch (error) {
            return {
                success: false,
                error: AUTH_ERRORS.TOKEN_INVALID,
            };
        }

        // Check for specific permission
        if (!decoded.permissions?.includes('AUTH:PASSWORD_CHANGE')) {
            return {
                success: false,
                error: AUTH_ERRORS.UNAUTHORIZED,
            };
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user
        const user = await prisma.user.update({
            where: { id: decoded.id },
            data: {
                password: hashedPassword,
                // @ts-ignore - fields exist
                firstLogin: false,
                forcePasswordChange: false,
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Flatten roles and permissions for the new tokens
        const roles = (user as any).userRoles.map((ur: any) => ur.role.name);
        const permissions = Array.from(new Set(
            (user as any).userRoles.flatMap((ur: any) =>
                ur.role.permissions.map((rp: any) =>
                    `${rp.permission.action}:${rp.permission.resource}`
                )
            )
        )) as string[];

        // Generate normal tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles,
            permissions,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        // const expiresAt = calculateExpiryDate(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY);
        // Re-implement calculateExpiryDate locally or import it if exported. 
        // It was not exported in the original file, so I need to copy the logic or export it.
        // Checking the file content again... it was NOT exported.
        // I will just use a hardcoded date for now or copy the logic.
        // Better: I'll use the same logic as in login function.

        const match = TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY.match(/^(\d+)([dhmsDHMS])$/);
        let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            const multipliers: Record<string, number> = {
                s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000,
            };
            expiresAt = new Date(Date.now() + value * multipliers[unit]);
        }

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    roles,
                    permissions,
                },
            },
            message: 'Password changed successfully',
        };

    } catch (error) {
        console.error('Change password error:', error);
        return {
            success: false,
            error: 'Internal server error',
        };
    }
}
