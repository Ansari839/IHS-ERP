
import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
    try {
        // Check if table exists using raw query
        const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE 'ItemMaster';
    `
        console.log("Found tables:", result)
    } catch (e) {
        console.error("Error checking tables:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
