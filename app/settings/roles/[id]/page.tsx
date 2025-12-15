import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { RolePermissionsForm } from '@/components/roles/role-permissions-form'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function RoleEditPage({ params }: PageProps) {
    const { id } = await params
    const roleId = parseInt(id)
    if (isNaN(roleId)) notFound()

    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
            permissions: true,
        },
    })

    if (!role) notFound()

    const allPermissions = await prisma.permission.findMany({
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    })

    // Group permissions by resource
    const permissionsByResource = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
            acc[perm.resource] = []
        }
        acc[perm.resource].push(perm)
        return acc
    }, {} as Record<string, typeof allPermissions>)

    // Get IDs of permissions currently assigned to this role
    const assignedPermissionIds = new Set(role.permissions.map((p) => p.permissionId))

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/settings/roles">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
                    <p className="text-muted-foreground">{role.description}</p>
                </div>
            </div>

            <RolePermissionsForm
                roleId={roleId}
                permissionsByResource={permissionsByResource}
                assignedPermissionIds={assignedPermissionIds}
            />

            {/* Spacer for fixed footer */}
            <div className="h-20" />
        </div>
    )
}
