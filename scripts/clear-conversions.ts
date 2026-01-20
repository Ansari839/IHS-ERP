
import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
    try {
        // defined in schema as UnitConversion (PascalCase) but usually mapped to "UnitConversion" or "unit_conversion" depending on naming convention. 
        // Prisma usually preserves case or uses public."UnitConversion".
        // Safest is to try Prisma Client first, if fails, use raw.

        // We use executeRaw to avoid client validation issues if schema mismatch
        await prisma.$executeRaw`DELETE FROM "UnitConversion";`
        console.log("Successfully deleted all data from UnitConversion table.")
    } catch (e) {
        console.error("Error deleting data:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
