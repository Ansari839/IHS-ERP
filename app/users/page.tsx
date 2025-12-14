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
import { Plus, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Protect } from '@/components/protect'

export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function UsersPage() {
    const user = await getCurrentUser()
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            userRoles: {
                include: {
                    role: true
                }
            },
            createdAt: true,
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <Protect permission="create:users">
                    <Link href="/users/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
                </Protect>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-primary" />
                                            </div>
                                            {user.name || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {user.userRoles.map((ur) => (
                                                <span key={ur.role.id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {ur.role.name}
                                                </span>
                                            ))}
                                            {user.userRoles.length === 0 && (
                                                <span className="text-muted-foreground text-xs">No roles</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No users found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
