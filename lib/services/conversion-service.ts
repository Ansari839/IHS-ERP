import prisma from "@/lib/prisma"
import { UnitConversion } from "@/app/generated/prisma/client"

export async function getAllConversions() {
    return await prisma.unitConversion.findMany({
        include: {
            fromUnit: true,
            toUnit: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createConversion(data: Omit<UnitConversion, "id" | "createdAt" | "updatedAt">) {
    // Prevent duplicate
    const existing = await prisma.unitConversion.findFirst({
        where: {
            fromUnitId: data.fromUnitId,
            toUnitId: data.toUnitId
        }
    })

    if (existing) {
        throw new Error("Conversion rule already exists")
    }

    // Check if units are of same type
    const fromUnit = await prisma.unit.findUnique({ where: { id: data.fromUnitId } })
    const toUnit = await prisma.unit.findUnique({ where: { id: data.toUnitId } })

    if (!fromUnit || !toUnit) throw new Error("Invalid units")
    if (fromUnit.unitType !== toUnit.unitType) {
        throw new Error("Cannot convert between different unit types")
    }

    return await prisma.unitConversion.create({
        data
    })
}

export async function updateConversion(id: number, data: Partial<Omit<UnitConversion, "id" | "createdAt" | "updatedAt">>) {
    return await prisma.unitConversion.update({
        where: { id },
        data
    })
}

export async function deleteConversion(id: number) {
    return await prisma.unitConversion.delete({
        where: { id }
    })
}

/**
 * Converts a quantity from one unit to another.
 * 1. Checks for direct conversion.
 * 2. Checks for reverse conversion.
 * 3. (Optional) Checks for path via base unit (A -> Base -> B).
 */
export async function convert(quantity: number, fromUnitId: number, toUnitId: number): Promise<number> {
    if (fromUnitId === toUnitId) return quantity

    // Direct
    const direct = await prisma.unitConversion.findUnique({
        where: {
            fromUnitId_toUnitId: {
                fromUnitId,
                toUnitId
            }
        }
    })

    if (direct) {
        return quantity * direct.conversionRate
    }

    // Reverse
    const reverse = await prisma.unitConversion.findUnique({
        where: {
            fromUnitId_toUnitId: {
                fromUnitId: toUnitId,
                toUnitId: fromUnitId
            }
        }
    })

    if (reverse) {
        return quantity / reverse.conversionRate
    }

    // Try via Base Unit? or chained?
    // For now, let's try 2-hop max.
    // Find conversion from A -> X
    // Find conversion from X -> B
    // Too complex for single SQL? 
    // Let's implement A -> Base -> B if both have conversion to/from base.
    
    // We can fetch ALL conversions for these units and graph search, but simpler:
    // Ideally we assume User defines conversion to BASE for every unit.
    // e.g. 1 Bag -> 50 KG. 1 KG -> 1000 Grams.
    // Bag -> Grams: Bag -> KG -> Grams.
    
    // Let's try to find a common unit they both convert to/from.
    // This is getting complicated. Let's stick to Direct/Reverse for MVP and maybe A->Common->B.
    
    // Find all conversions involving FromUnit
    const fromConversions = await prisma.unitConversion.findMany({
        where: { OR: [{ fromUnitId }, { toUnitId: fromUnitId }] },
        include: { fromUnit: true, toUnit: true }
    })
    
    // Find all conversions involving ToUnit
    const toConversions = await prisma.unitConversion.findMany({
        where: { OR: [{ fromUnitId: toUnitId }, { toUnitId: toUnitId }] }
    })

    // Look for intersection
    // ...
    
    throw new Error(`Conversion path not found from unit ${fromUnitId} to ${toUnitId}`)
}
