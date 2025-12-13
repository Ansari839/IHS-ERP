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
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
