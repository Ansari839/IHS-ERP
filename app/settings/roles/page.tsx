import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createRole } from '@/app/actions/roles'

export const dynamic = 'force-dynamic'

export default async function RolesPage() {
    const roles = await prisma.role.findMany({
        include: {
            _count: {
                select: { userRoles: true },
            },
        },
        orderBy: { name: 'asc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Role Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createRole} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="e.g. Inventory Manager"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    id="description"
                                    placeholder="Role description"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Roles List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div>{role.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {role.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{role._count.userRoles}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/settings/roles/${role.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Manage Permissions
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
