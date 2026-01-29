
import { getSalesReturns } from '@/app/actions/fabtex/sales-return'
import { columns } from '@/components/fabtex/sales/sales-return-columns'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Undo2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesReturnList() {
    const data = await getSalesReturns('YARN')

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales Returns</h2>
                    <p className="text-muted-foreground">
                        Manage customer returns (Credit Notes).
                    </p>
                </div>
                <Button asChild variant="destructive">
                    <Link href="/dashboard/fab-tex/sales/sales-return/new">
                        <Undo2 className="mr-2 h-4 w-4" />
                        New Return
                    </Link>
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="returnNumber" />
        </div>
    )
}
