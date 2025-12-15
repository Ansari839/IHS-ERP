import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft } from 'lucide-react'
import { updateUser } from '@/app/actions/users'
import { Protect } from '@/components/protect'

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
            userRoles: true
        }
    })

    if (!user) {
        notFound()
    }

    const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
    })

    const userRoleIds = user.userRoles.map(ur => ur.roleId)

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
                        <form action={updateUser.bind(null, userId)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user.name || ''}
                                    placeholder="John Doe"
                                    required
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
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Protect>
    )
}
