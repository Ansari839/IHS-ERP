
import { getSalesOrders } from '@/app/actions/fabtex/sales-order'
import { columns } from '@/components/fabtex/sales/sales-order-columns'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesOrderList() {
    const data = await getSalesOrders('YARN')

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
                    <p className="text-muted-foreground">
                        Manage your Local and Export sales orders.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/fab-tex/sales/sales-order/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New SO
                    </Link>
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="soNumber" />
        </div>
    )
}
