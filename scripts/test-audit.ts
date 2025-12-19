import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { logAudit, getAuditLogs } = await import('../lib/audit')
    const { default: prisma } = await import('../lib/prisma')

    console.log('Testing Audit Logging...')
    const dbUrl = process.env.DATABASE_URL || ''
    console.log('DATABASE_URL loaded:', dbUrl ? `${dbUrl.substring(0, 15)}...` : 'NO')

    // 1. Create a dummy user for testing if needed, or use existing
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('No user found to test audit logging')
        return
    }

    console.log(`Using user: ${user.email} (ID: ${user.id})`)

    // 2. Log an action
    const actionId = `test-${Date.now()}`
    console.log('Logging test action...')
    await logAudit({
        userId: user.id,
        action: 'CUSTOM',
        module: 'TEST_SCRIPT',
        resourceId: actionId,
        before: { status: 'inactive' },
        after: { status: 'active' },
        metadata: { source: 'script' }
    })

    // 3. Retrieve logs
    console.log('Retrieving logs...')
    // Give it a moment as logAudit is async
    await new Promise(r => setTimeout(r, 1000))

    const logs = await getAuditLogs({
        userId: user.id,
        module: 'TEST_SCRIPT'
    })

    const found = logs.data.find(l => l.resourceId === actionId)

    if (found) {
        console.log('✅ Audit log verification successful!')
        console.log('Log entry:', found)
    } else {
        console.error('❌ Failed to retrieve audit log')
    }

    await prisma.$disconnect()
}

main().catch(e => {
    console.error('Error Message:', e.message)
    if (e.code) console.error('Error Code:', e.code)
    if (e.meta) console.error('Error Meta:', e.meta)
})
