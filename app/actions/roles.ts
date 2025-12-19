'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createSafeAction } from '@/lib/create-safe-action'
import { verifyPermission } from '@/lib/auth-checks'

// --- Create Role ---

export const createRole = createSafeAction(
    async (formData: FormData) => {
        await verifyPermission('create:settings')

        const name = formData.get('name') as string
        const description = formData.get('description') as string

        if (!name) {
            throw new Error('Role name is required')
        }

        const role = await prisma.role.create({
            data: {
                name,
                description,
            },
        })

        revalidatePath('/settings/roles')
        return role
    },
    {
        action: 'CREATE',
        module: 'ROLES',
        getResourceId: (role) => role.id.toString(),
        getBefore: async () => null,
        getAfter: async (role) => role,
    }
)

// --- Update Role Permissions ---

type UpdatePermissionsInput = {
    roleId: number
    permissionIds: number[]
}

export const updateRolePermissions = createSafeAction(
    async (input: UpdatePermissionsInput) => {
        await verifyPermission('update:settings')
        const { roleId, permissionIds } = input

        // 1. Remove all existing permissions for this role
        await prisma.rolePermission.deleteMany({
            where: { roleId },
        })

        // 2. Add selected permissions
        if (permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: permissionIds.map((id) => ({
                    roleId,
                    permissionId: id,
                })),
            })
        }

        revalidatePath(`/settings/roles/${roleId}`)
        revalidatePath('/settings/roles')
        return { roleId, count: permissionIds.length }
    },
    {
        action: 'UPDATE',
        module: 'ROLES',
        getResourceId: (res) => res.roleId.toString(),
        getBefore: async (input) => {
            // Fetch existing permissions for audit log
            const existing = await prisma.rolePermission.findMany({
                where: { roleId: input.roleId },
                select: { permissionId: true }
            })
            return { permissionIds: existing.map(p => p.permissionId) }
        },
        getAfter: async (res, ctx) => {
            return { permissionIds: res.count } // Simplified for brevity
        }
    }
)

// --- Delete Role ---

export const deleteRole = createSafeAction(
    async (roleId: number) => {
        await verifyPermission('delete:settings')

        // Check if role is assigned to any users
        const usageCount = await prisma.userRole.count({
            where: { roleId },
        })

        if (usageCount > 0) {
            throw new Error('Cannot delete role because it is assigned to users')
        }

        const role = await prisma.role.delete({
            where: { id: roleId },
        })

        revalidatePath('/settings/roles')
        return role
    },
    {
        action: 'DELETE',
        module: 'ROLES',
        getResourceId: (role) => role.id.toString(),
        getBefore: async (roleId) => {
            return await prisma.role.findUnique({ where: { id: roleId } })
        },
        getAfter: async () => null
    }
)

