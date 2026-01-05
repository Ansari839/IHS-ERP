import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission, hasRole } from '@/lib/rbac'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!hasPermission(user, 'read:audit_logs')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        let monitorableUsers: { id: number; name: string | null; email: string }[] = []

        if (hasRole(user, 'SUPER_ADMIN')) {
            // Super Admin can see everyone except other Super Admins if you want to be strict,
            // but usually they see everyone.
            // Let's filter out who they see based on requirements.
            monitorableUsers = await prisma.user.findMany({
                where: { isActive: true },
                select: { id: true, name: true, email: true },
                orderBy: { name: 'asc' }
            })
        } else {
            // Non-Super Admins see themselves + authorized juniors (EXCLUDING any Super Admins)
            const authorizedAccess = await prisma.auditAccess.findMany({
                where: {
                    seniorId: user.id,
                    junior: {
                        userRoles: {
                            none: {
                                role: {
                                    name: 'SUPER_ADMIN'
                                }
                            }
                        }
                    }
                },
                include: {
                    junior: {
                        select: { id: true, name: true, email: true }
                    }
                }
            })

            monitorableUsers = [
                { id: user.id, name: user.name, email: user.email },
                ...authorizedAccess.map(aa => aa.junior)
            ]
        }

        return NextResponse.json(monitorableUsers)
    } catch (error) {
        console.error('Failed to fetch monitorable users:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
