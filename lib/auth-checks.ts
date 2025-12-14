import { getCurrentUser } from '@/lib/auth'
import { hasPermission, hasRole } from '@/lib/rbac'

export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message)
        this.name = 'UnauthorizedError'
    }
}

export async function verifyPermission(permission: string) {
    const user = await getCurrentUser()

    if (!user) {
        throw new UnauthorizedError('Not authenticated')
    }

    if (!hasPermission(user, permission)) {
        throw new UnauthorizedError(`Missing required permission: ${permission}`)
    }

    return user
}

export async function verifyRole(role: string) {
    const user = await getCurrentUser()

    if (!user) {
        throw new UnauthorizedError('Not authenticated')
    }

    if (!hasRole(user, role)) {
        throw new UnauthorizedError(`Missing required role: ${role}`)
    }

    return user
}
