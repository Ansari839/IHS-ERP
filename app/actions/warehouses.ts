'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createSafeAction } from '@/lib/create-safe-action'
import { verifyPermission } from '@/lib/auth-checks'

// --- Create Warehouse ---

export const createWarehouse = createSafeAction(
    async (formData: FormData) => {
        await verifyPermission('create:settings') // Using settings permission for now, ideally create:warehouses

        const name = formData.get('name') as string
        const location = formData.get('location') as string
        const contactPerson = formData.get('contactPerson') as string
        // Parse contactNumbers from JSON string
        const contactNumbersJson = formData.get('contactNumbers') as string
        const contactNumbers = contactNumbersJson ? JSON.parse(contactNumbersJson) : []
        const status = (formData.get('status') as string) || 'ACTIVE'

        if (!name) {
            throw new Error('Warehouse name is required')
        }

        const warehouse = await prisma.warehouse.create({
            data: {
                name,
                location,
                contactPerson,
                contactNumbers,
                status,
                segment: (formData.get('segment') as any) || 'GENERAL',
            },
        })

        revalidatePath('/inventory/warehouses')
        return warehouse
    },
    {
        action: 'CREATE',
        module: 'WAREHOUSES',
        getResourceId: (w) => w.id.toString(),
        getBefore: async () => null,
        getAfter: async (w) => w,
    }
)

// --- Update Warehouse ---

type UpdateWarehouseInput = {
    id: number
    name?: string
    location?: string
    contactPerson?: string
    contactNumbers?: string[]
    status?: string
}

export const updateWarehouse = createSafeAction(
    async (input: UpdateWarehouseInput) => {
        await verifyPermission('update:settings')
        const { id, ...data } = input

        const warehouse = await prisma.warehouse.update({
            where: { id },
            data,
        })

        revalidatePath('/inventory/warehouses')
        return warehouse
    },
    {
        action: 'UPDATE',
        module: 'WAREHOUSES',
        getResourceId: (w) => w.id.toString(),
        getBefore: async (input) => prisma.warehouse.findUnique({ where: { id: input.id } }),
        getAfter: async (w) => w,
    }
)

// --- Delete Warehouse ---

export const deleteWarehouse = createSafeAction(
    async (id: number) => {
        await verifyPermission('delete:settings')

        // Check if warehouse has inventory (placeholder for future check)
        // const inventoryCount = await prisma.inventory.count({ where: { warehouseId: id } })
        // if (inventoryCount > 0) throw new Error('Cannot delete warehouse with inventory')

        const warehouse = await prisma.warehouse.delete({
            where: { id },
        })

        revalidatePath('/inventory/warehouses')
        return warehouse
    },
    {
        action: 'DELETE',
        module: 'WAREHOUSES',
        getResourceId: (w) => w.id.toString(),
        getBefore: async (id) => prisma.warehouse.findUnique({ where: { id } }),
        getAfter: async () => null,
    }
)

export async function getWarehouses(segment?: string) {
    return await prisma.warehouse.findMany({
        where: {
            ...(segment && { segment: segment as any })
        },
        orderBy: { name: 'asc' }
    })
}
