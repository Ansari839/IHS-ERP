import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Testing standard Prisma connection...')
    try {
        const userCount = await prisma.user.count()
        console.log('User count:', userCount)

        console.log('Testing parallel queries...')
        const [posts, published, recent] = await Promise.all([
            prisma.post.count(),
            prisma.post.count({ where: { published: true } }),
            prisma.post.findMany({ take: 5 })
        ])
        console.log('Posts:', posts)
        console.log('Published:', published)
        console.log('Recent:', recent.length)

    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
