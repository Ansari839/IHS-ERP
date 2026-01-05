import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Protect } from '@/components/protect'
import { EditUserForm } from '@/components/users/edit-user-form'
import { UserWarehouseForm } from '@/components/users/user-warehouse-form'

interface EditUserPageProps {
    params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
        notFound()
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: true,
            auditLogPermissions: true,
            userWarehouses: {
                include: {
                    warehouse: true
                }
            }
        }
    })

    if (!user) {
        notFound()
    }

    const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
    })

    const warehouses = await prisma.warehouse.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })

    const allUsers = await prisma.user.findMany({
        where: {
            id: { not: userId },
            isActive: true,
            userRoles: {
                none: {
                    role: {
                        name: 'SUPER_ADMIN'
                    }
                }
            }
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' }
    })

    return (
        <Protect permission="update:users" fallback={<div>Unauthorized</div>}>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EditUserForm user={user as any} roles={roles} allUsers={allUsers} />
                    </CardContent>
                </Card>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Warehouse Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserWarehouseForm
                            userId={userId}
                            assignedWarehouses={user.userWarehouses.map(uw => uw.warehouse)}
                            availableWarehouses={warehouses}
                        />
                    </CardContent>
                </Card>
            </div>
        </Protect >
    )
}
