import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function FabTexPurchasePage() {
    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Fabric Purchase</h1>
                    <p className="text-muted-foreground">Manage fabric purchasing and procurement operations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/fab-tex/purchase/purchase-order" className="block">
                    <div className="p-6 border rounded-xl bg-card hover:shadow-lg transition-all border-primary/20 hover:border-primary">
                        <ShoppingCart className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Purchase Orders</h3>
                        <p className="text-sm text-muted-foreground">Create and manage Local & Import purchase orders.</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
