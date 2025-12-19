import { getCurrentUser } from '@/lib/auth'
import { logAudit, AuditAction } from '@/lib/audit'

type ActionContext = {
    userId: number
}

type AuditConfig<TInput, TOutput> = {
    action: AuditAction
    module: string
    getResourceId?: (output: TOutput) => string | undefined
    getBefore?: (input: TInput, ctx: ActionContext) => Promise<any>
    getAfter?: (output: TOutput, ctx: ActionContext) => Promise<any>
}

/**
 * Higher-Order Function to wrap Server Actions with:
 * 1. Authentication check
 * 2. Error handling
 * 3. Audit logging
 */
export function createSafeAction<TInput, TOutput>(
    handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
    auditConfig?: AuditConfig<TInput, TOutput>
) {
    return async (input: TInput): Promise<{ success: boolean; data?: TOutput; error?: string }> => {
        try {
            // 1. Authentication
            const user = await getCurrentUser()
            if (!user) {
                return { success: false, error: 'Unauthorized' }
            }

            const ctx: ActionContext = { userId: user.id }

            // 2. Capture 'Before' state
            let beforeState = undefined
            if (auditConfig?.getBefore) {
                try {
                    beforeState = await auditConfig.getBefore(input, ctx)
                } catch (e) {
                    console.warn('Failed to capture audit before state', e)
                }
            }

            // 3. Execute Handler
            const result = await handler(input, ctx)

            // 4. Capture 'After' state & Log Audit
            if (auditConfig) {
                let afterState = undefined
                if (auditConfig.getAfter) {
                    try {
                        afterState = await auditConfig.getAfter(result, ctx)
                    } catch (e) {
                        console.warn('Failed to capture audit after state', e)
                    }
                }

                // Log asynchronously
                logAudit({
                    userId: user.id,
                    action: auditConfig.action,
                    module: auditConfig.module,
                    resourceId: auditConfig.getResourceId ? auditConfig.getResourceId(result) : undefined,
                    before: beforeState,
                    after: afterState,
                    metadata: {
                        // We could add IP/UserAgent here if we passed headers
                    }
                })
            }

            return { success: true, data: result }

        } catch (error) {
            console.error('Action failed:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred'
            }
        }
    }
}
