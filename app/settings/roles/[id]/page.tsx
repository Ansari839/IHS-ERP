import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { updateRolePermissions } from '@/app/actions/roles'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: {
        id: string
    }
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

    async function savePermissions(formData: FormData) {
        'use server'
        const selectedPermissionIds = Array.from(formData.keys())
            .filter((key) => key.startsWith('perm_'))
            .map((key) => parseInt(key.replace('perm_', '')))

        await updateRolePermissions(roleId, selectedPermissionIds)
    }

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

            <form action={savePermissions}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                        <Card key={resource}>
                            <CardHeader className="pb-3">
                                <CardTitle className="capitalize">{resource}</CardTitle>
                                <CardDescription>Manage {resource} access</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {permissions.map((perm) => (
                                        <div key={perm.id} className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                id={`perm_${perm.id}`}
                                                name={`perm_${perm.id}`}
                                                defaultChecked={assignedPermissionIds.has(perm.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label
                                                    htmlFor={`perm_${perm.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                                >
                                                    {perm.action}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {perm.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:pl-64">
                    <div className="mx-auto max-w-4xl flex justify-end gap-4">
                        <Link href="/settings/roles">
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Save Permissions
                        </Button>
                    </div>
                </div>
            </form>

            {/* Spacer for fixed footer */}
            <div className="h-20" />
        </div>
    )
}
