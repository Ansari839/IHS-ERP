import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Dashboard | IHS-ERP",
    description: "IHS-ERP Dashboard - Manage your textile operations",
}

/**
 * Dashboard Layout
 * 
 * Protected layout for authenticated users.
 */
import { DashboardLayout as DashboardLayoutComponent } from "@/components/dashboard-layout"
import { getCurrentUser } from "@/lib/auth"

/**
 * Dashboard Layout
 * 
 * Protected layout for authenticated users.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <DashboardLayoutComponent user={user} title="Textile ERP">
            {children}
        </DashboardLayoutComponent>
    )
}
