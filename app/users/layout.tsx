import { getCurrentUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function UsersLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <DashboardLayout title="User Management" user={user}>
            {children}
        </DashboardLayout>
    )
}
