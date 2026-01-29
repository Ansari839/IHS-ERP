
import { getDeliveryOrders } from '@/app/actions/fabtex/delivery-order'
import { columns } from '@/components/fabtex/sales/delivery-order-columns'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DeliveryOrderList() {
    const data = await getDeliveryOrders('YARN')

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Delivery Orders</h2>
                    <p className="text-muted-foreground">
                        Manage your Outward Delivery (Gate Pass / Challan).
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/fab-tex/sales/delivery-order/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New DO
                    </Link>
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="doNumber" />
        </div>
    )
}
