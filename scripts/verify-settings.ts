
import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
    console.log("Starting Global Settings Verification...")

    try {
        // --- 1. Fiscal Year Verification ---
        console.log("\n--- Testing Fiscal Year Logic ---")

        // Cleanup FY
        await prisma.fiscalYear.deleteMany()

        // Create FY 2024 (Active)
        const fy24 = await prisma.fiscalYear.create({
            data: {
                name: 'FY 2024',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                isActive: true
            }
        })
        console.log(`Created Active ${fy24.name}`)

        // Create FY 2025 (Inactive)
        const fy25 = await prisma.fiscalYear.create({
            data: {
                name: 'FY 2025',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
                isActive: false
            }
        })
        console.log(`Created Inactive ${fy25.name}`)

        // Activate FY 2025 via Transaction Logic (mimicking service)
        // We test the logic: Unset all active, set target active.
        await prisma.$transaction([
            prisma.fiscalYear.updateMany({ where: { isActive: true }, data: { isActive: false } }),
            prisma.fiscalYear.update({ where: { id: fy25.id }, data: { isActive: true } })
        ])
        console.log("Activated FY 2025")

        // Check Results
        const check24 = await prisma.fiscalYear.findUnique({ where: { id: fy24.id } })
        const check25 = await prisma.fiscalYear.findUnique({ where: { id: fy25.id } })

        if (check24?.isActive) throw new Error("FY 2024 should be inactive")
        if (!check25?.isActive) throw new Error("FY 2025 should be active")
        console.log("✅ Fiscal Year Single-Active Rule Verified")


        // --- 2. Currency Verification ---
        console.log("\n--- Testing Currency Logic ---")

        // Cleanup Currencies
        await prisma.currency.deleteMany()

        // Create USD (Base)
        const usd = await prisma.currency.create({
            data: { code: 'USD', symbol: '$', isBase: true, exchangeRate: 1.0 }
        })
        console.log("Created Base USD")

        // Create EUR (Not Base)
        const eur = await prisma.currency.create({
            data: { code: 'EUR', symbol: '€', isBase: false, exchangeRate: 0.85 }
        })
        console.log("Created EUR")

        // Set EUR as Base (Atomic Swap)
        await prisma.$transaction(async (tx) => {
            await tx.currency.updateMany({ where: { isBase: true }, data: { isBase: false } })
            await tx.currency.update({ where: { id: eur.id }, data: { isBase: true, exchangeRate: 1.0 } })
        })
        console.log("Set EUR as Base")

        // Check Results
        const checkUsd = await prisma.currency.findUnique({ where: { id: usd.id } })
        const checkEur = await prisma.currency.findUnique({ where: { id: eur.id } })

        if (checkUsd?.isBase) throw new Error("USD should not be base")
        if (!checkEur?.isBase) throw new Error("EUR should be base")
        if (checkEur?.exchangeRate !== 1.0) throw new Error("New Base EUR should have rate 1.0")

        console.log("✅ Currency Single-Base Rule Verified")
        console.log("\nVerification Passed!")

    } catch (e) {
        console.error("Verification Failed:", e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
