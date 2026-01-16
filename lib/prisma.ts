import { PrismaClient } from '../app/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
  prisma_v3: PrismaClient
  pool: Pool
}

const connectionString = `${process.env.DATABASE_URL}`

const pool = globalForPrisma.pool || new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = globalForPrisma.prisma_v3 || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma_v3 = prisma
  globalForPrisma.pool = pool
}

export default prisma