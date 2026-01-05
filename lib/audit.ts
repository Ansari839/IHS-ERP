import prisma from '@/lib/prisma'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ASSIGN_WAREHOUSE' | 'REMOVE_WAREHOUSE' | 'CUSTOM'

interface AuditLogEntry {
    userId: number
    action: AuditAction
    module: string
    resourceId?: string
    before?: any
    after?: any
    metadata?: any
}

/**
 * Log an action to the audit table
 * This function is fire-and-forget to avoid blocking the main response
 */
export async function logAudit(entry: AuditLogEntry) {
    try {
        // We don't await this to ensure it doesn't block the main thread
        // However, in a serverless environment (like Vercel), we might need to await it
        // or use `waitUntil` from `@vercel/functions` if available.
        // For standard Node.js/Next.js server actions, awaiting is safer to ensure it completes.
        await prisma.auditLog.create({
            data: {
                userId: entry.userId,
                action: entry.action,
                module: entry.module,
                resourceId: entry.resourceId,
                before: entry.before ? entry.before : undefined,
                after: entry.after ? entry.after : undefined,
                metadata: entry.metadata ? entry.metadata : undefined,
            },
        })
    } catch (error) {
        // Fail-safe: logging failure should not break the application
        console.error('Failed to create audit log:', error)
    }
}

/**
 * Retrieve audit logs with optional filtering and pagination
 */
export async function getAuditLogs(params: {
    page?: number
    limit?: number
    userIds?: number[] // Support multiple IDs for hierarchy
    module?: string
    action?: string
    startDate?: Date
    endDate?: Date
}) {
    const { page = 1, limit = 10, userIds, module, action, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = {
        module,
        action,
        timestamp: {
            gte: startDate,
            lte: endDate,
        },
    }

    if (userIds && userIds.length > 0) {
        where.userId = { in: userIds }
    }

    const [data, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.auditLog.count({ where }),
    ])

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}
