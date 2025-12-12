/**
 * User Role Constants
 * 
 * Role-based access control (RBAC) configuration.
 */

export const USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    [USER_ROLES.SUPER_ADMIN]: 3,
    [USER_ROLES.ADMIN]: 2,
    [USER_ROLES.USER]: 1,
};

// Role permissions
export const ROLE_PERMISSIONS = {
    [USER_ROLES.SUPER_ADMIN]: [
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'admin.access',
        'settings.manage',
        'system.configure',
    ],
    [USER_ROLES.ADMIN]: [
        'user.create',
        'user.read',
        'user.update',
        'admin.access',
    ],
    [USER_ROLES.USER]: [
        'user.read',
    ],
} as const;
