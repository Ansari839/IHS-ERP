import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ProfileView } from '@/components/profile/profile-view'
import { ThemeSettings } from '@/components/settings/theme-settings'
import { DashboardLayout } from '@/components/dashboard-layout'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: {
            department: true,
            userRoles: {
                include: {
                    role: true
                }
            }
        }
    })

    if (!user) {
        redirect('/login')
    }

    // Fetch Company Info (Default to first record)
    const company = await prisma.company.findFirst()
    const companyName = company?.legalName || company?.tradeName || "IHS Textile ERP"

    // Determine primary role
    const primaryRole = user.userRoles[0]?.role?.name || "N/A"
    const departmentName = user.department?.name || "Unassigned"
    const employeeId = `EMP-${user.id.toString().padStart(4, '0')}`

    const userForLayout = {
        ...currentUser,
        image: user.image
    }

    return (
        <DashboardLayout title="My Profile" user={userForLayout}>
            <ProfileView
                user={user}
                primaryRole={primaryRole}
                departmentName={departmentName}
                employeeId={employeeId}
                companyName={companyName}
                themeSettings={<ThemeSettings />}
            />
        </DashboardLayout>
    )
}
