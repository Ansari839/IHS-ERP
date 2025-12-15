'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Save, Loader2 } from 'lucide-react'
import { updateRolePermissions } from '@/app/actions/roles'
import { toast } from 'sonner'

interface Permission {
    id: number
    action: string
    resource: string
    description: string | null
}

interface RolePermissionsFormProps {
    roleId: number
    permissionsByResource: Record<string, Permission[]>
    assignedPermissionIds: Set<number>
}

export function RolePermissionsForm({ roleId, permissionsByResource, assignedPermissionIds }: RolePermissionsFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        const selectedPermissionIds = Array.from(formData.keys())
            .filter((key) => key.startsWith('perm_'))
            .map((key) => parseInt(key.replace('perm_', '')))

        startTransition(async () => {
            const result = await updateRolePermissions(roleId, selectedPermissionIds)

            if (result.success) {
                toast.success('Permissions updated successfully')
                router.push('/settings/roles')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update permissions')
            }
        })
    }

    return (
        <form action={handleSubmit}>
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
                                        <Checkbox
                                            id={`perm_${perm.id}`}
                                            name={`perm_${perm.id}`}
                                            defaultChecked={assignedPermissionIds.has(perm.id)}
                                            disabled={isPending}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={`perm_${perm.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                            >
                                                {perm.action}
                                            </Label>
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
                        <Button variant="outline" type="button" disabled={isPending}>Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Permissions
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    )
}
