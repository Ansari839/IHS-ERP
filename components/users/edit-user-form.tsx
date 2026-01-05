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
import { Loader2, ChevronDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Role {
    id: number
    name: string
}

interface UserData {
    id: number
    name: string | null
    email: string
    auditLogPermissions: { juniorId: number }[]
    userRoles: { roleId: number }[]
}

interface EditUserFormProps {
    user: UserData
    roles: Role[]
    allUsers: { id: number; name: string | null; email: string }[]
}

export function EditUserForm({ user, roles, allUsers }: EditUserFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const userRoleIds = user.userRoles.map(ur => ur.roleId)
    const [selectedSubordinates, setSelectedSubordinates] = useState<number[]>(
        user.auditLogPermissions.map(alp => alp.juniorId)
    )

    const toggleSubordinate = (id: number) => {
        setSelectedSubordinates(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

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
                <Label className="text-base">Audit Log Access</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            disabled={isPending}
                        >
                            {selectedSubordinates.length === 0
                                ? "Select users to monitor..."
                                : `${selectedSubordinates.length} users selected`}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto">
                        <DropdownMenuLabel>Monitorable Users</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allUsers.map((u) => (
                            <DropdownMenuCheckboxItem
                                key={u.id}
                                checked={selectedSubordinates.includes(u.id)}
                                onCheckedChange={() => toggleSubordinate(u.id)}
                                onSelect={(e) => e.preventDefault()} // Keep open on select
                            >
                                {u.name || u.email}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Hidden inputs to send data to server action */}
                {selectedSubordinates.map(id => (
                    <input key={id} type="hidden" name="subordinates" value={id} />
                ))}

                <p className="text-sm text-muted-foreground">
                    Super Admin: Pick users whose audit logs this person is allowed to monitor. (Super Admins are hidden and protected).
                </p>
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
