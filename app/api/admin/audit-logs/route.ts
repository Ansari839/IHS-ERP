import { NextRequest, NextResponse } from 'next/server'
import { getAuditLogs } from '@/lib/audit'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

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

        // 2. Parse Query Parameters
        const searchParams = req.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined
        const module = searchParams.get('module') || undefined
        const action = searchParams.get('action') || undefined
        const startDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
        const endDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

        // 3. Fetch Logs
        const result = await getAuditLogs({
            page,
            limit,
            userId,
            module,
            action,
            startDate,
            endDate,
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to fetch audit logs:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
