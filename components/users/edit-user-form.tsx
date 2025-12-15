'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { updateUser } from '@/app/actions/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Role {
    id: number
    name: string
}

interface UserData {
    id: number
    name: string | null
    email: string
    userRoles: { roleId: number }[]
}

interface EditUserFormProps {
    user: UserData
    roles: Role[]
}

export function EditUserForm({ user, roles }: EditUserFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const userRoleIds = user.userRoles.map(ur => ur.roleId)

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateUser(user.id, formData)

            if (result.success) {
                toast.success('User updated successfully')
                router.push('/users')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update user')
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ''}
                    placeholder="John Doe"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    placeholder="john@example.com"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="space-y-2">
                <Label>Roles</Label>
                <div className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
                    {roles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`role-${role.id}`}
                                name="roles"
                                value={role.id.toString()}
                                defaultChecked={userRoleIds.includes(role.id)}
                                disabled={isPending}
                            />
                            <Label
                                htmlFor={`role-${role.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {role.name}
                            </Label>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">
                    Select at least one role for the user.
                </p>
            </div>

            <div className="flex justify-end gap-4">
                <Link href="/users">
                    <Button variant="outline" type="button" disabled={isPending}>
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </form>
    )
}
