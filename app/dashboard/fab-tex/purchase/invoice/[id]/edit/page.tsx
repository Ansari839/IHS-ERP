import { getPurchaseInvoiceById, getEligibleForInvoicing } from '@/app/actions/fabtex/purchase-invoice'
import { InvoiceForm } from '@/components/fabtex/purchase-invoice/invoice-form'
import { notFound } from 'next/navigation'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invoice = await getPurchaseInvoiceById(id)
    const purchaseOrders = await getEligibleForInvoicing()

    if (!invoice) notFound()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit Purchase Invoice</h2>
            </div>
            <InvoiceForm
                purchaseOrders={purchaseOrders}
                initialData={invoice}
                invoiceId={id}
            />
        </div>
    )
}
