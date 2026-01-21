
import { PrismaClient } from '../app/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking PurchaseOrderItem table structure...')
    try {
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'PurchaseOrderItem';
    `
        console.log('Columns in PurchaseOrderItem:')
        console.table(result)
    } catch (error) {
        console.error('Error checking table:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
