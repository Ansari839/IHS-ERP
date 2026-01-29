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
    ChevronDown,
    ScrollText,
    LucideIcon,
    Scale,
    ArrowLeftRight,
    Clock,
    Wallet,
    Receipt,
    Factory,
    Shirt,
    Banknote,
    Palette,
    Tag,
    Box,
    Award,
    Layers,
    Undo2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { hasPermission } from "@/lib/rbac"
import { TokenPayload } from "@/types/auth.types"

type NavigationItem = {
    name: string
    href?: string
    icon: LucideIcon
    children?: {
        name: string
        href?: string
        icon?: LucideIcon
        permission?: string
        children?: {
            name: string
            href: string
            icon?: LucideIcon
            permission?: string
        }[]
    }[]
    permission?: string
}

const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
        name: "FAB TEX",
        icon: Factory,
        children: [
            {
                name: "Product",
                icon: Shirt,
                children: [
                    { name: "Item Master", href: "/dashboard/fab-tex/products/item-master", icon: Package, permission: "read:inventory" },
                    { name: "Item Group", href: "/dashboard/fab-tex/products/item-group", icon: Layers, permission: "read:inventory" },
                    { name: "Colors", href: "/dashboard/fab-tex/products/colors", icon: Palette, permission: "read:inventory" },
                    { name: "Brands", href: "/dashboard/fab-tex/products/brands", icon: Tag, permission: "read:inventory" },
                    { name: "Units & Conversions", href: "/dashboard/fab-tex/products/uom", icon: Scale, permission: "read:inventory" },
                    { name: "Item Packing", href: "/dashboard/fab-tex/products/item-packing", icon: Box, permission: "read:inventory" },
                    { name: "Item Grade", href: "/dashboard/fab-tex/products/item-grade", icon: Award, permission: "read:inventory" },
                    { name: "Warehouses", href: "/dashboard/fab-tex/warehouses", icon: Warehouse, permission: "read:inventory" },
                ]
            },
            {
                name: "Purchase",
                icon: ShoppingCart,
                children: [
                    { name: "Purchase Order", href: "/dashboard/fab-tex/purchase/purchase-order", icon: Layers, permission: "read:inventory" },
                    { name: "Goods Receipt Note (GRN)", href: "/dashboard/fab-tex/purchase/grn", icon: Package, permission: "read:inventory" },
                    { name: "Purchase Invoice", href: "/dashboard/fab-tex/purchase/invoice", icon: Receipt, permission: "read:inventory" },
                    { name: "Purchase Return", href: "/dashboard/fab-tex/purchase/purchase-return", icon: Undo2, permission: "read:inventory" },
                    { name: "Vendors", href: "/dashboard/fab-tex/purchase/vendors", icon: Users, permission: "read:inventory" },
                ]
            },
            {
                name: "Sale",
                icon: Banknote,
                children: [
                    { name: "Sales Order", href: "/dashboard/fab-tex/sales/sales-order", icon: Layers, permission: "read:inventory" },
                    { name: "Delivery Order (DO)", href: "/dashboard/fab-tex/sales/delivery-order", icon: Package, permission: "read:inventory" },
                    { name: "Sales Invoice", href: "/dashboard/fab-tex/sales/invoice", icon: Receipt, permission: "read:inventory" },
                    { name: "Sales Return", href: "/dashboard/fab-tex/sales/sales-return", icon: Undo2, permission: "read:inventory" },
                    { name: "Customers", href: "/dashboard/fab-tex/sales/customers", icon: Users, permission: "read:inventory" },
                ]
            },
            {
                name: "Reports",
                icon: BarChart3,
                children: [
                    { name: "Stock Ledger", href: "/dashboard/fab-tex/reports/stock", icon: ScrollText, permission: "read:reports" },
                ]
            },
        ]
    },
    {
        name: "Production",
        icon: Package,
        children: [
            {
                name: "In-House Production",
                icon: Package,
                children: [
                    { name: "Shifts", href: "/dashboard/production/in-house/shifts", icon: Clock, permission: "read:inventory" },
                    { name: "Operators", href: "/dashboard/production/in-house/operators", icon: Users, permission: "read:inventory" },
                    { name: "Machines", href: "/dashboard/production/in-house/machines", icon: Settings, permission: "read:inventory" },
                ]
            },
            {
                name: "Out-House Production",
                icon: Package,
                children: [
                    { name: "Outsource Orders", href: "/dashboard/production/out-house/orders", icon: Package, permission: "read:inventory" },
                ]
            },
            {
                name: "Sample Production",
                icon: Package,
                children: [
                    { name: "Sample Requests", href: "/dashboard/production/samples/requests", icon: Package, permission: "read:inventory" },
                ]
            },
            {
                name: "Products",
                icon: Package,
                children: [
                    { name: "Products", href: "/dashboard/production/products", icon: Package, permission: "read:inventory" },
                    { name: "Categories", href: "/dashboard/production/categories", icon: Settings, permission: "read:inventory" },
                    { name: "Specifications", href: "/dashboard/production/variants", icon: Settings, permission: "read:inventory" },
                ]
            },
            { name: "Locations", href: "/dashboard/production/locations", icon: Warehouse, permission: "read:inventory" },
        ]
    },
    {
        name: "Inventory",
        icon: Warehouse,
        children: [
            { name: "Warehouses", href: "/dashboard/inventory/warehouses", icon: Warehouse, permission: "read:warehouses" },
            { name: "Units", href: "/dashboard/inventory/units", icon: Scale, permission: "read:inventory" },
            { name: "Conversions", href: "/dashboard/inventory/conversions", icon: ArrowLeftRight, permission: "read:inventory" },
        ]
    },
    {
        name: "Finance",
        icon: Wallet,
        children: [
            { name: "Chart of Accounts", href: "/dashboard/finance/coa", icon: Wallet, permission: "read:inventory" },
            { name: "Vouchers", href: "/dashboard/finance/vouchers", icon: Receipt, permission: "read:inventory" },
        ]
    },
    // { name: "Orders", href: "/orders", icon: ShoppingCart },
    // { name: "Customers", href: "/customers", icon: Users },
    // { name: "Reports", href: "/reports", icon: BarChart3 },
    {
        name: "Users",
        icon: Users,
        children: [
            { name: "All Users", href: "/users", icon: Users, permission: "read:users" },
            { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText, permission: "read:audit_logs" },
        ]
    },
    {
        name: "Settings",
        icon: Settings,
        children: [
            { name: "General Settings", href: "/dashboard/settings/global", icon: Settings, permission: "read:settings" },
            { name: "Roles & Permissions", href: "/settings/roles", icon: Users, permission: "read:roles" },
        ]
    },
]

interface SidebarProps {
    className?: string
    user?: TokenPayload | null
    isCollapsed?: boolean
    onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ className, user, isCollapsed = false, onCollapse }: SidebarProps) {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = React.useState<string[]>([])

    const toggleExpand = (name: string, levelItems?: any[]) => {
        setExpandedItems(prev => {
            const isCurrentlyExpanded = prev.includes(name);

            // If we are collapsing, just remove it
            if (isCurrentlyExpanded) {
                return prev.filter(item => item !== name);
            }

            // If we are expanding, we need to handle accordion behavior
            // 1. Keep all items that are NOT siblings of the current item (i.e. keep parents, keep unrelated submenus)
            // But since 'levelItems' tells us exactly what the siblings are, we can just remove all siblings from 'prev'
            // and then add the new one.

            let newExpanded = [...prev];

            if (levelItems) {
                const siblingNames = levelItems.map(i => i.name);
                newExpanded = newExpanded.filter(item => !siblingNames.includes(item));
            }

            return [...newExpanded, name];
        })
    }

    const filteredNavigation = navigation.filter(item => {
        if (item.permission && !hasPermission(user || null, item.permission)) return false

        if (item.children) {
            // Filter children based on permissions
            const visibleChildren = item.children.filter(child =>
                !child.permission || hasPermission(user || null, child.permission)
            )
            // If no visible children, hide the parent
            if (visibleChildren.length === 0) return false
            return true
        }

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
                        onClick={() => onCollapse?.(!isCollapsed)}
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
                            const isActive = item.href ? pathname === item.href : false
                            const isExpanded = expandedItems.includes(item.name)
                            const hasChildren = item.children && item.children.length > 0

                            if (hasChildren) {
                                return (
                                    <div key={item.name}>
                                        <button
                                            onClick={() => !isCollapsed && toggleExpand(item.name, filteredNavigation)}
                                            className={cn(
                                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                                isCollapsed && "justify-center"
                                            )}
                                            title={isCollapsed ? item.name : undefined}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="h-5 w-5 shrink-0" />
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        isExpanded && "rotate-180"
                                                    )}
                                                />
                                            )}
                                        </button>
                                        {!isCollapsed && isExpanded && (
                                            <div className="mt-1 space-y-1 pl-10">
                                                {item.children!.map((child) => {
                                                    const isChildExpanded = expandedItems.includes(child.name)
                                                    const hasSubChildren = child.children && child.children.length > 0

                                                    if (hasSubChildren) {
                                                        return (
                                                            <div key={child.name}>
                                                                <button
                                                                    onClick={() => toggleExpand(child.name, item.children)}
                                                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                                >
                                                                    <span>{child.name}</span>
                                                                    <ChevronDown
                                                                        className={cn(
                                                                            "h-4 w-4 transition-transform",
                                                                            isChildExpanded && "rotate-180"
                                                                        )}
                                                                    />
                                                                </button>
                                                                {isChildExpanded && (
                                                                    <div className="mt-1 space-y-1 pl-4">
                                                                        {child.children!.map((subChild) => {
                                                                            const isSubChildActive = pathname === subChild.href
                                                                            return (
                                                                                <Link
                                                                                    key={subChild.name}
                                                                                    href={subChild.href}
                                                                                    className={cn(
                                                                                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                                                        isSubChildActive
                                                                                            ? "bg-primary/10 text-primary"
                                                                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                                                    )}
                                                                                >
                                                                                    {subChild.name}
                                                                                </Link>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    }

                                                    const isChildActive = pathname === child.href
                                                    return (
                                                        <Link
                                                            key={child.name}
                                                            href={child.href!}
                                                            className={cn(
                                                                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                                isChildActive
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                            )}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href!}
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
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email || ''}
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
    const [expandedItems, setExpandedItems] = React.useState<string[]>([])

    const toggleExpand = (name: string, levelItems?: any[]) => {
        setExpandedItems(prev => {
            const isCurrentlyExpanded = prev.includes(name);
            if (isCurrentlyExpanded) {
                return prev.filter(item => item !== name);
            }
            let newExpanded = [...prev];
            if (levelItems) {
                const siblingNames = levelItems.map(i => i.name);
                newExpanded = newExpanded.filter(item => !siblingNames.includes(item));
            }
            return [...newExpanded, name];
        })
    }

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
                                const isActive = item.href ? pathname === item.href : false
                                const isExpanded = expandedItems.includes(item.name)
                                const hasChildren = item.children && item.children.length > 0

                                if (hasChildren) {
                                    return (
                                        <div key={item.name}>
                                            <button
                                                onClick={() => toggleExpand(item.name, navigation)}
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-5 w-5 shrink-0" />
                                                    <span>{item.name}</span>
                                                </div>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 transition-transform",
                                                        isExpanded && "rotate-180"
                                                    )}
                                                />
                                            </button>
                                            {isExpanded && (
                                                <div className="mt-1 space-y-1 pl-10">
                                                    {item.children!.map((child) => {
                                                        const isChildExpanded = expandedItems.includes(child.name)
                                                        const hasSubChildren = child.children && child.children.length > 0

                                                        if (hasSubChildren) {
                                                            return (
                                                                <div key={child.name}>
                                                                    <button
                                                                        onClick={() => toggleExpand(child.name, item.children)}
                                                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                                    >
                                                                        <span>{child.name}</span>
                                                                        <ChevronDown
                                                                            className={cn(
                                                                                "h-4 w-4 transition-transform",
                                                                                isChildExpanded && "rotate-180"
                                                                            )}
                                                                        />
                                                                    </button>
                                                                    {isChildExpanded && (
                                                                        <div className="mt-1 space-y-1 pl-4">
                                                                            {child.children!.map((subChild) => {
                                                                                const isSubChildActive = pathname === subChild.href
                                                                                return (
                                                                                    <Link
                                                                                        key={subChild.name}
                                                                                        href={subChild.href}
                                                                                        onClick={() => setOpen(false)}
                                                                                        className={cn(
                                                                                            "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                                                            isSubChildActive
                                                                                                ? "bg-primary/10 text-primary"
                                                                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                                                        )}
                                                                                    >
                                                                                        {subChild.name}
                                                                                    </Link>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        }

                                                        const isChildActive = pathname === child.href
                                                        return (
                                                            <Link
                                                                key={child.name}
                                                                href={child.href!}
                                                                onClick={() => setOpen(false)}
                                                                className={cn(
                                                                    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                                    isChildActive
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                                )}
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href!}
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
