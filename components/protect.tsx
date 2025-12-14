import { getCurrentUser } from '@/lib/auth'
import { hasPermission, hasRole } from '@/lib/rbac'
import { ReactNode } from 'react'

interface ProtectProps {
    children: ReactNode
    permission?: string
    role?: string
    fallback?: ReactNode
}

export async function Protect({ children, permission, role, fallback = null }: ProtectProps) {
    const user = await getCurrentUser()

    if (permission && !hasPermission(user, permission)) {
        return <>{fallback}</>
    }

    if (role && !hasRole(user, role)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
