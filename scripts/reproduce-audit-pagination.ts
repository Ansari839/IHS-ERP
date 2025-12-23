
import { getAuditLogs, logAudit } from '../lib/audit'
import prisma from '../lib/prisma'

async function main() {
    console.log('Seeding audit logs...')
    // Create 25 logs
    for (let i = 0; i < 25; i++) {
        await logAudit({
            userId: 1, // Assuming user 1 exists, otherwise this might fail if foreign key constraint. 
            // Check if we need to find a user first.
            action: 'CUSTOM',
            module: 'TEST',
            metadata: { index: i }
        })
    }
    console.log('Seeding complete.')

    console.log('Testing getAuditLogs with limit 10...')
    const result = await getAuditLogs({ page: 1, limit: 10 })

    console.log(`Fetched ${result.data.length} logs.`)
    console.log('Meta:', result.meta)

    if (result.data.length === 10) {
        console.log('✅ Pagination Limit Check Passed')
    } else {
        console.error(`❌ Pagination Limit Check Failed: Expected 10, got ${result.data.length}`)
    }

    if (result.meta.totalPages >= 3) {
        console.log('✅ Total Pages Check Passed')
    } else {
        console.error('❌ Total Pages Check Failed')
    }

    // Cleanup if needed? No, logic logs are fine.
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
