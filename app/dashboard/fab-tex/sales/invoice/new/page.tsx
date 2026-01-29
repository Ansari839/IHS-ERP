
export const dynamic = 'force-dynamic'

import { SalesInvoiceForm } from '@/components/fabtex/sales/sales-invoice-form'
import { getInvoiceFormData } from '@/app/actions/fabtex/sales-invoice'

export default async function NewSalesInvoicePage() {
    const formData = await getInvoiceFormData()

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Sales Invoice</h2>
                <p className="text-muted-foreground">Generate a new invoice from Sales Order or Delivery Order.</p>
            </div>

            <SalesInvoiceForm {...formData} />
        </div>
    )
}
