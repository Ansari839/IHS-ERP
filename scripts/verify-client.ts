import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import prisma from '../lib/prisma'

async function main() {
    console.log('Checking Prisma Client...')
    // @ts-ignore
    if (prisma.warehouse) {
        console.log('✅ prisma.warehouse exists')
    } else {
        console.error('❌ prisma.warehouse is UNDEFINED')
        // Log keys to see what IS available
        console.log('Keys on prisma instance:', Object.keys(prisma))
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
