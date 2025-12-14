'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

import { verifyPermission } from '@/lib/auth-checks'

export async function createRole(formData: FormData) {
    try {
        await verifyPermission('create:settings')
    } catch (error) {
        return { success: false, error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) {
        return { success: false, error: 'Role name is required' }
    }

    try {
        await prisma.role.create({
            data: {
                name,
                description,
            },
        })

        revalidatePath('/settings/roles')
    } catch (error) {
        console.error('Error creating role:', error)
        return { success: false, error: 'Failed to create role' }
    }

    redirect('/settings/roles')
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
    try {
        await verifyPermission('update:settings')

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
        return { success: true }
    } catch (error) {
        console.error('Error updating role permissions:', error)
        return { success: false, error: 'Failed to update permissions' }
    }
}

export async function deleteRole(roleId: number) {
    try {
        await verifyPermission('delete:settings')

        // Check if role is assigned to any users
        const usageCount = await prisma.userRole.count({
            where: { roleId },
        })

        if (usageCount > 0) {
            return { success: false, error: 'Cannot delete role because it is assigned to users' }
        }

        await prisma.role.delete({
            where: { id: roleId },
        })

        revalidatePath('/settings/roles')
        return { success: true }
    } catch (error) {
        console.error('Error deleting role:', error)
        return { success: false, error: 'Failed to delete role' }
    }
}
