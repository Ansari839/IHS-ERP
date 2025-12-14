import { TokenPayload } from '@/types/auth.types'

export function hasPermission(user: TokenPayload | null, permission: string): boolean {
    if (!user || !user.permissions) {
        return false
    }

    // Super Admins bypass checks (optional, but good practice)
    if (user.roles?.includes('SUPER_ADMIN')) {
        return true
    }

    return user.permissions.includes(permission)
}

export function hasRole(user: TokenPayload | null, role: string): boolean {
    if (!user || !user.roles) {
        return false
    }
    return user.roles.includes(role)
}
