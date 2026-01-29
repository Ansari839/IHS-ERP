
import { getSalesInvoices } from '@/app/actions/fabtex/sales-invoice'
import { columns } from '@/components/fabtex/sales/sales-invoice-columns'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesInvoiceList() {
    const data = await getSalesInvoices('YARN')

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales Invoices</h2>
                    <p className="text-muted-foreground">
                        Manage your customer invoices and payments.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/fab-tex/sales/invoice/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Link>
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchKey="invoiceNumber" />
        </div>
    )
}
