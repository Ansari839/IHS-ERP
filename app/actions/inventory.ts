"use server"

import { revalidatePath } from "next/cache"
import {
    createUnit as createUnitService,
    updateUnit as updateUnitService,
    deleteUnit as deleteUnitService,
    getAllUnits as getAllUnitsService
} from "@/lib/services/unit-service"
import {
    createConversion as createConversionService,
    updateConversion as updateConversionService,
    deleteConversion as deleteConversionService,
    getAllConversions as getAllConversionsService
} from "@/lib/services/conversion-service"
import { hasPermission } from "@/lib/rbac"
import { getCurrentUser } from "@/lib/auth" // Assuming this exists or similar

// --- Units ---

export async function createUnit(data: any) {
    // Permission check (mocked for now or use actual)
    // const user = await getCurrentUser()
    // if (!hasPermission(user, "create:inventory")) throw new Error("Unauthorized")

    await createUnitService(data)
    revalidatePath("/dashboard/inventory/units")
}

export async function updateUnit(id: number, data: any) {
    await updateUnitService(id, data)
    revalidatePath("/dashboard/inventory/units")
}

export async function deleteUnit(id: number) {
    await deleteUnitService(id)
    revalidatePath("/dashboard/inventory/units")
}

// --- Conversions ---

export async function createConversion(data: any) {
    await createConversionService(data)
    revalidatePath("/dashboard/inventory/conversions")
}

export async function updateConversion(id: number, data: any) {
    await updateConversionService(id, data)
    revalidatePath("/dashboard/inventory/conversions")
}

export async function deleteConversion(id: number) {
    await deleteConversionService(id)
    revalidatePath("/dashboard/inventory/conversions")
}
