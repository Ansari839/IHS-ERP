"use client"

import * as React from "react"
import { Sidebar, MobileSidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"

import { TokenPayload } from "@/types/auth.types"

interface DashboardLayoutProps {
    children: React.ReactNode
    title?: string
    user?: TokenPayload | null
}

export function DashboardLayout({ children, title, user }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

    return (
        <div className="relative min-h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar user={user} />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar />

            {/* Main Content */}
            <div
                className={cn(
                    "transition-all duration-300",
                    "md:pl-64", // Default sidebar width
                    "min-h-screen"
                )}
            >
                <Header title={title} />
                <main className="p-6">{children}</main>
            </div>
        </div>
    )
}
