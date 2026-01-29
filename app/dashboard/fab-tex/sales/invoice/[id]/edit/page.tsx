
import { SalesInvoiceForm } from '@/components/fabtex/sales/sales-invoice-form'
import { getInvoiceFormData, getSalesInvoiceById } from '@/app/actions/fabtex/sales-invoice'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditInvoicePageProps {
    params: Promise<{ id: string }>
}

export default async function EditSalesInvoicePage({ params }: EditInvoicePageProps) {
    const { id } = await params
    const [invoice, formData] = await Promise.all([
        getSalesInvoiceById(id),
        getInvoiceFormData()
    ])

    if (!invoice) {
        notFound()
    }

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Sales Invoice</h2>
                <p className="text-muted-foreground">Modify invoice details.</p>
            </div>

            <SalesInvoiceForm
                {...formData}
                initialData={invoice}
                invoiceId={id}
            />
        </div>
    )
}
