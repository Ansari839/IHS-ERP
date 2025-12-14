"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Inventory", href: "/inventory", icon: Warehouse },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Users", href: "/users", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
]

import { hasPermission } from "@/lib/rbac"
import { TokenPayload } from "@/types/auth.types"

interface SidebarProps {
    className?: string
    user?: TokenPayload | null
}

export function Sidebar({ className, user }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const pathname = usePathname()

    const filteredNavigation = navigation.filter(item => {
        if (item.name === "Users" && !hasPermission(user || null, "read:users")) return false
        if (item.name === "Settings" && !hasPermission(user || null, "read:settings")) return false
        return true
    })

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    {!isCollapsed && (
                        <h1 className="text-lg font-bold text-foreground">Textile ERP</h1>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn("ml-auto", isCollapsed && "mx-auto")}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-3 py-4">
                    <nav className="space-y-1">
                        {filteredNavigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                        isCollapsed && "justify-center"
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t border-border p-4">
                    <div
                        className={cn(
                            "flex items-center gap-3",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">JD</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-foreground truncate">
                                    John Doe
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    admin@textile.com
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    )
}

// Mobile Sidebar
export function MobileSidebar() {
    const [open, setOpen] = React.useState(false)
    const pathname = usePathname()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden fixed top-3 left-3 z-50"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b border-border px-4">
                        <h1 className="text-lg font-bold text-foreground">Textile ERP</h1>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="border-t border-border p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">JD</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-foreground truncate">
                                    John Doe
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    admin@textile.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
