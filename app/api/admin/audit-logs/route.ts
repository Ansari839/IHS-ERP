import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/audit'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission, hasRole } from '@/lib/rbac'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // 1. Authentication & Authorization
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has admin permissions
        if (!hasPermission(user, 'read:audit_logs')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Determine Visibility (Hierarchy Logic)
        let userIds: number[] | undefined = undefined

        if (!hasRole(user, 'SUPER_ADMIN')) {
            // Find juniorIds from AuditAccess table
            // BUT FILTER OUT anyone who has the SUPER_ADMIN role
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
                select: { juniorId: true }
            })

            const juniorIds = authorizedAccess.map(aa => aa.juniorId)
            userIds = [user.id, ...juniorIds]
        }

        // 3. Parse Query Parameters
        const searchParams = req.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // If a specific userId is requested, ensure the current user has permission to see it
        const requestedUserId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined

        if (requestedUserId) {
            if (userIds && !userIds.includes(requestedUserId)) {
                return NextResponse.json({ error: 'Access denied to this user\'s logs' }, { status: 403 })
            }
            userIds = [requestedUserId]
        }

        const module = searchParams.get('module') || undefined
        const action = searchParams.get('action') || undefined
        const startDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
        const endDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

        // 4. Fetch Logs
        const result = await getAuditLogs({
            page,
            limit,
            userIds,
            module,
            action,
            startDate,
            endDate,
        })

        // 5. Hard Privacy Rule: If requester is not SUPER_ADMIN, filter out any SUPER_ADMIN logs 
        // (Just in case they got added to juniors somehow)
        if (!hasRole(user, 'SUPER_ADMIN')) {
            result.data = result.data.filter((log: any) => {
                // This would require checking roles of each user in logs, 
                // but since we already filtered userIds in step 2 to ONLY include authorized juniors,
                // we should ensure those juniors are NOT super admins.
                return true // Step 2 already handles ID filtering
            })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to fetch audit logs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
