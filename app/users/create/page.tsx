import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { UserForm } from './user-form'

export const dynamic = 'force-dynamic'

export default async function CreateUserPage() {
    const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>
                        Add a new user to the system. They will receive an email with their credentials.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserForm roles={roles} />
                </CardContent>
            </Card>
        </div>
    )
}
