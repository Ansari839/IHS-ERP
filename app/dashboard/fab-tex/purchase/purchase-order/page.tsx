
import { getPurchaseOrders } from '@/app/actions/fabtex/purchase-order'
import { columns } from '@/components/fabtex/purchase-order/purchase-order-columns'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrderPage() {
    const data = await getPurchaseOrders()

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                    <p className="text-muted-foreground">
                        Manage your Local and Import purchase orders.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/fab-tex/purchase/purchase-order/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New PO
                    </Link>
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="poNumber" />
        </div>
    )
}
