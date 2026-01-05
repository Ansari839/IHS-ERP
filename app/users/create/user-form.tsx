'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
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
    description: string | null
}

interface UserFormProps {
    roles: Role[]
    allUsers: { id: number; name: string | null; email: string }[]
}

export function UserForm({ roles, allUsers }: UserFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string>('')
    const [selectedSubordinates, setSelectedSubordinates] = useState<number[]>([])

    const toggleSubordinate = (id: number) => {
        setSelectedSubordinates(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    async function handleSubmit(formData: FormData) {
        setError('')
        startTransition(async () => {
            const result = await createUser(formData)
            if (result && !result.success) {
                setError(result.error || 'Failed to create user')
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="••••••••"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Roles
                    </label>
                    <div className="grid gap-2 border rounded-md p-4">
                        {roles.map((role) => (
                            <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox id={`role_${role.id}`} name="roles" value={role.id.toString()} />
                                <Label htmlFor={`role_${role.id}`}>{role.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-base font-semibold">Audit Log Access</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between"
                            disabled={isPending}
                            type="button"
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
                                onSelect={(e) => e.preventDefault()}
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
                    Super Admin: Grant this user permission to view logs of the selected subordinates. (Super Admins are protected).
                </p>
            </div>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-4">
                <Link href="/users">
                    <Button variant="outline" type="button">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                </Button>
            </div>
        </form>
    )
}
