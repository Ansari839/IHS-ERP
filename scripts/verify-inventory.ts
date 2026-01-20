import 'dotenv/config'
import prisma from '../lib/prisma'

// Ideally we assume User defines conversion to BASE for every unit.
// e.g. 1 Bag -> 50 KG. 1 KG -> 1000 Grams.

// const prisma = new PrismaClient() // Don't instantiate new one, use the one with adapter if needed

async function main() {
    console.log("Starting Inventory Verification...")
    console.log("Prisma keys:", Object.keys(prisma))
    // console.log("Prisma unit:", prisma.unit)

    try {
        // 1. Cleanup specific test data if it exists (using names to identify)
        // Note: deleteMany on units might fail if other conversions exist, so we need to be careful.
        // For this test script, we'll try to delete what we create.

        // Find existing test units
        const existingKg = await prisma.unit.findFirst({ where: { name: 'Kilogram' } })
        const existingGram = await prisma.unit.findFirst({ where: { name: 'Gram' } })

        if (existingKg) {
            await prisma.unitConversion.deleteMany({
                where: { OR: [{ fromUnitId: existingKg.id }, { toUnitId: existingKg.id }] }
            })
            await prisma.unit.delete({ where: { id: existingKg.id } })
        }
        if (existingGram) {
            await prisma.unitConversion.deleteMany({
                where: { OR: [{ fromUnitId: existingGram.id }, { toUnitId: existingGram.id }] }
            })
            await prisma.unit.delete({ where: { id: existingGram.id } })
        }

        console.log("Cleaned up old test data.")

        // 2. Create Units
        // Fetch default company first
        const company = await prisma.company.findFirst()
        if (!company) throw new Error("No company found for testing")

        const kg = await prisma.unit.create({
            data: {
                name: 'Kilogram',
                symbol: 'kg',
                unitType: 'WEIGHT',
                isBase: true,
                code: 'UOM-TEST-001',
                companyId: company.id
            }
        })
        console.log("Created Base Unit:", kg.name)

        const gram = await prisma.unit.create({
            data: {
                name: 'Gram',
                symbol: 'g',
                unitType: 'WEIGHT',
                isBase: false,
                code: 'UOM-TEST-002',
                companyId: company.id
            }
        })
        console.log("Created Unit:", gram.name)

        // 3. Create Conversion (1 kg = 1000 g)
        const conversion = await prisma.unitConversion.create({
            data: {
                fromUnitId: kg.id,
                toUnitId: gram.id,
                conversionRate: 1000
            }
        })
        console.log(`Created Conversion: 1 ${kg.symbol} = ${conversion.conversionRate} ${gram.symbol}`)

        // 4. Test Logic (Mocking the logic)
        const qty = 5 // 5 kg
        // Convert to grams
        let rate = 0
        const direct = await prisma.unitConversion.findUnique({
            where: { fromUnitId_toUnitId: { fromUnitId: kg.id, toUnitId: gram.id } }
        })
        if (direct) rate = direct.conversionRate

        const result = qty * rate
        console.log(`Converting 5 kg to g: Expected 5000, Got ${result}`)

        if (result !== 5000) throw new Error("Conversion logic failed")

        // 5. Test Reverse
        // Convert 5000 g to kg
        const reverse = await prisma.unitConversion.findUnique({
            where: { fromUnitId_toUnitId: { fromUnitId: kg.id, toUnitId: gram.id } }
        })

        let reverseResult = 0
        if (reverse) {
            reverseResult = 5000 / reverse.conversionRate
        }
        console.log(`Converting 5000 g to kg: Expected 5, Got ${reverseResult}`)

        if (reverseResult !== 5) throw new Error("Reverse conversion logic failed")

        console.log("Verification Passed!")

    } catch (e) {
        console.error("Verification Failed:", e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
