import { getPurchaseInvoiceById, getInvoiceFormData } from '@/app/actions/fabtex/purchase-invoice'
import { InvoiceForm } from '@/components/fabtex/purchase-invoice/invoice-form'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ViewInvoicePage({ params }: { params: { id: string } }) {
    const { id } = params
    const invoice = await getPurchaseInvoiceById(id)
    const formData = await getInvoiceFormData()

    if (!invoice) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <InvoiceForm
                {...formData}
                initialData={invoice}
                invoiceId={id}
                readOnly={true}
            />
        </div>
    )
}
