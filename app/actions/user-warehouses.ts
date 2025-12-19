'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createSafeAction } from '@/lib/create-safe-action'
import { verifyPermission } from '@/lib/auth-checks'

// --- Assign Warehouse to User ---

type AssignWarehouseInput = {
    userId: number
    warehouseId: number
}

export const assignWarehouseToUser = createSafeAction(
    async (input: AssignWarehouseInput) => {
        await verifyPermission('update:users')

        const { userId, warehouseId } = input

        const assignment = await prisma.userWarehouse.create({
            data: {
                userId,
                warehouseId,
            },
        })

        revalidatePath(`/users/${userId}/edit`)
        return assignment
    },
    {
        action: 'ASSIGN_WAREHOUSE',
        module: 'USERS',
        getResourceId: (a) => `${a.userId}-${a.warehouseId}`,
        getBefore: async () => null,
        getAfter: async (a) => a,
    }
)

// --- Remove Warehouse from User ---

type RemoveWarehouseInput = {
    userId: number
    warehouseId: number
}

export const removeWarehouseFromUser = createSafeAction(
    async (input: RemoveWarehouseInput) => {
        await verifyPermission('update:users')

        const { userId, warehouseId } = input

        const assignment = await prisma.userWarehouse.delete({
            where: {
                userId_warehouseId: {
                    userId,
                    warehouseId,
                },
            },
        })

        revalidatePath(`/users/${userId}/edit`)
        return assignment
    },
    {
        action: 'REMOVE_WAREHOUSE',
        module: 'USERS',
        getResourceId: (a) => `${a.userId}-${a.warehouseId}`,
        getBefore: async (input) => prisma.userWarehouse.findUnique({
            where: { userId_warehouseId: { userId: input.userId, warehouseId: input.warehouseId } }
        }),
        getAfter: async () => null,
    }
)
