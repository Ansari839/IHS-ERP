import prisma from '@/lib/prisma'

export async function getAllCurrencies() {
    return await prisma.currency.findMany({
        orderBy: { code: 'asc' }
    })
}

export async function getBaseCurrency() {
    return await prisma.currency.findFirst({
        where: { isBase: true }
    })
}

export async function createCurrency(data: {
    code: string
    symbol: string
    exchangeRate?: number
    isBase?: boolean
}) {
    // If setting as base, handle atomic swap
    if (data.isBase) {
        return await prisma.$transaction(async (tx) => {
            // Unset current base
            await tx.currency.updateMany({
                where: { isBase: true },
                data: { isBase: false }
            })
            // Create new base (exchange rate 1.0)
            return await tx.currency.create({
                data: {
                    ...data,
                    isBase: true,
                    exchangeRate: 1.0
                }
            })
        })
    }

    return await prisma.currency.create({
        data: {
            ...data,
            isBase: false,
            // If not base, use provided rate or default 1.0
            exchangeRate: data.exchangeRate || 1.0
        }
    })
}

export async function updateCurrency(id: number, data: {
    code?: string
    symbol?: string
    exchangeRate?: number
}) {
    const currency = await prisma.currency.findUnique({ where: { id } })
    if (currency?.isBase && data.exchangeRate !== undefined && data.exchangeRate !== 1.0) {
        throw new Error("Base currency exchange rate must be 1.0")
    }

    return await prisma.currency.update({
        where: { id },
        data
    })
}

export async function setBaseCurrency(id: number) {
    return await prisma.$transaction(async (tx) => {
        await tx.currency.updateMany({
            where: { isBase: true },
            data: { isBase: false } // Old base becomes normal currency, rate should functionally be recalculated but for now stays as is
        })

        // New base becomes 1.0
        return await tx.currency.update({
            where: { id },
            data: {
                isBase: true,
                exchangeRate: 1.0
            }
        })
    })
}

export async function deleteCurrency(id: number) {
    const currency = await prisma.currency.findUnique({ where: { id } })
    if (currency?.isBase) {
        throw new Error("Cannot delete the base currency")
    }
    return await prisma.currency.delete({
        where: { id }
    })
}
