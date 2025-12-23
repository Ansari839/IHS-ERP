/**
 * Authentication Types
 * 
 * TypeScript interfaces and types for the authentication system.
 */

// User Types
export interface User {
    id: number;
    email: string;
    name: string | null;
    image?: string | null; // Profile picture URL
    roles?: string[]; // Simplified list of role names
    permissions?: string[]; // Simplified list of permission strings "action:resource"
}

export interface UserWithPassword extends User {
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// Token Types
export interface TokenPayload {
    id: number;
    email: string;
    name: string | null;
    image?: string | null;
    roles?: string[];
    permissions?: string[];
    type: 'access' | 'refresh';
    exp?: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Request/Response Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
    requirePasswordChange?: boolean;
    tempToken?: string;
    userId?: number;
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

export interface ChangePasswordRequest {
    tempToken: string;
    newPassword: string;
}

// Controller Response Types
export interface ControllerSuccess<T = any> {
    success: true;
    data: T;
    message?: string;
}

export interface ControllerError {
    success: false;
    error: string;
    validationErrors?: Record<string, string>;
}

export type ControllerResponse<T = any> = ControllerSuccess<T> | ControllerError;

// Middleware Types
export interface AuthenticatedUser {
    id: number;
    email: string;
    name: string | null;
}

export interface AuthResult {
    authenticated: true;
    user: AuthenticatedUser;
}

export interface AuthError {
    authenticated: false;
    error: {
        success: false;
        error: {
            message: string;
        };
    };
}

export type AuthMiddlewareResult = AuthResult | AuthError;

// Validation Types
export interface ValidationResult {
    isValid: boolean;
    error?: string;
    errors?: Record<string, string>;
}
