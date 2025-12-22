import prisma from '@/lib/prisma'

export async function getAllFiscalYears() {
    return await prisma.fiscalYear.findMany({
        orderBy: { startDate: 'desc' }
    })
}

export async function getActiveFiscalYear() {
    return await prisma.fiscalYear.findFirst({
        where: { isActive: true }
    })
}

export async function createFiscalYear(data: {
    name: string
    startDate: Date
    endDate: Date
}) {
    // Basic validation: End date > Start date
    if (data.endDate <= data.startDate) {
        throw new Error("End date must be after start date")
    }

    // Overlap check (optional but good)
    const overlap = await prisma.fiscalYear.findFirst({
        where: {
            OR: [
                { startDate: { lte: data.endDate, gte: data.startDate } },
                { endDate: { lte: data.endDate, gte: data.startDate } }
            ]
        }
    })

    if (overlap) {
        throw new Error(`Fiscal Year overlaps with existing year: ${overlap.name}`)
    }

    return await prisma.fiscalYear.create({
        data
    })
}

export async function updateFiscalYear(id: number, data: {
    name?: string
    startDate?: Date
    endDate?: Date
}) {
    return await prisma.fiscalYear.update({
        where: { id },
        data
    })
}

export async function activateFiscalYear(id: number) {
    // Transaction to ensure only one is active
    return await prisma.$transaction([
        prisma.fiscalYear.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        }),
        prisma.fiscalYear.update({
            where: { id },
            data: { isActive: true }
        })
    ])
}

export async function lockFiscalYear(id: number) {
    return await prisma.fiscalYear.update({
        where: { id },
        data: { isLocked: true }
    })
}

export async function deleteFiscalYear(id: number) {
    const fy = await prisma.fiscalYear.findUnique({ where: { id } })
    if (fy?.isActive) {
        throw new Error("Cannot delete the active fiscal year")
    }
    // Also check for transactions in this period? For now just allow delete if not active.
    return await prisma.fiscalYear.delete({
        where: { id }
    })
}
