import { getCurrentUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <DashboardLayout title="Settings" user={user}>
            {children}
        </DashboardLayout>
    )
}
