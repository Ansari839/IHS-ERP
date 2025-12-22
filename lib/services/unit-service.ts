import prisma from "@/lib/prisma"
import { Unit } from "@/app/generated/prisma/client"

export async function getAllUnits() {
    return await prisma.unit.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getUnitById(id: number) {
    return await prisma.unit.findUnique({
        where: { id }
    })
}

export async function createUnit(data: Omit<Unit, "id" | "createdAt" | "updatedAt">) {
    // If isBase is true, check if another base unit exists for this type
    if (data.isBase) {
        const existingBase = await prisma.unit.findFirst({
            where: {
                unitType: data.unitType,
                isBase: true
            }
        })

        if (existingBase) {
            throw new Error(`A base unit already exists for type ${data.unitType}: ${existingBase.name}`)
        }
    }

    return await prisma.unit.create({
        data
    })
}

export async function updateUnit(id: number, data: Partial<Omit<Unit, "id" | "createdAt" | "updatedAt">>) {
    if (data.isBase) {
        const existingBase = await prisma.unit.findFirst({
            where: {
                unitType: data.unitType,
                isBase: true,
                NOT: { id }
            }
        })

        if (existingBase) {
            throw new Error(`A base unit already exists for type ${data.unitType}: ${existingBase.name}`)
        }
    }

    return await prisma.unit.update({
        where: { id },
        data
    })
}

export async function deleteUnit(id: number) {
    // Check for dependencies
    const conversions = await prisma.unitConversion.findFirst({
        where: {
            OR: [
                { fromUnitId: id },
                { toUnitId: id }
            ]
        }
    })

    if (conversions) {
        throw new Error("Cannot delete unit: Used in conversions")
    }

    // TODO: Check for usage in Products/Transactions when those modules are ready

    return await prisma.unit.delete({
        where: { id }
    })
}
