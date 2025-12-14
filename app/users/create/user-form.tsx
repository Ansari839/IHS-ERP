'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Role {
    id: number
    name: string
    description: string | null
}

interface UserFormProps {
    roles: Role[]
}

export function UserForm({ roles }: UserFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string>('')

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
