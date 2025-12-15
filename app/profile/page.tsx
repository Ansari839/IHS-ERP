import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ProfileForm } from '@/components/profile/profile-form'
import { DashboardLayout } from '@/components/dashboard-layout'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
            name: true,
            email: true,
        }
    })

    if (!user) {
        redirect('/login')
    }

    return (
        <DashboardLayout title="My Profile" user={currentUser}>
            <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <ProfileForm user={user} />
            </div>
        </DashboardLayout>
    )
}
