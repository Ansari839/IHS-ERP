import { getInvoiceFormData } from '@/app/actions/fabtex/purchase-invoice'
import { InvoiceForm } from '@/components/fabtex/purchase-invoice/invoice-form'

export const dynamic = 'force-dynamic'

export default async function CreateInvoicePage() {
    const data = await getInvoiceFormData()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create Purchase Invoice</h2>
            </div>
            <InvoiceForm {...data} />
        </div>
    )
}

