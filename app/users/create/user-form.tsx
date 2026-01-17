'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/app/actions/users'
import { Button } from '@/components/ui/button'
import { Loader2, User, Mail, Lock, Shield, Eye, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from "@/components/ui/card" // Card
import { Input } from "@/components/ui/input" // Input
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
        <form action={handleSubmit} className="space-y-6">

            {/* --- Account Information --- */}
            <Card className="border-none shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                            <User className="w-5 h-5" /> Personal Information
                        </h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" /> Full Name
                            </Label>
                            <div className="relative">
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary"
                                    placeholder="John Doe"
                                />
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" /> Email Address
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary"
                                    placeholder="john@example.com"
                                />
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Lock className="w-4 h-4" /> Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="pl-9 bg-background/50 border-primary/20 focus:border-primary"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Roles & Permissions --- */}
            <Card className="border-none shadow-sm bg-muted/30">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Access & Permissions
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <ShieldCheck className="w-4 h-4" /> Assign Roles
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {roles.map((role) => (
                                <label key={role.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background hover:border-primary/50 transition-all cursor-pointer">
                                    <Checkbox id={`role_${role.id}`} name="roles" value={role.id.toString()} className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                                    <span className="text-sm font-medium">{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" /> Audit Log Access
                        </Label>
                        <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between bg-background/50 h-10"
                                        disabled={isPending}
                                        type="button"
                                    >
                                        {selectedSubordinates.length === 0
                                            ? <span className="text-muted-foreground">Select users to monitor...</span>
                                            : <span className="text-primary font-medium">{selectedSubordinates.length} users selected</span>}
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

                            <div className="flex gap-2 items-start text-sm text-muted-foreground bg-primary/5 p-3 rounded-md">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                                <p>
                                    Super Admin Privileges: Granting this permission allows the user to view activity logs for selected subordinates.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center gap-2">
                    <Shield className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
                <Link href="/users">
                    <Button variant="outline" type="button">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={isPending} className="min-w-[150px] shadow-lg shadow-primary/20">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                </Button>
            </div>
        </form>
    )
}
