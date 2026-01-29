import { getSalesInvoiceById } from '@/app/actions/fabtex/sales-invoice'
import SalesInvoiceDetailClient from '@/components/fabtex/sales/SalesInvoiceDetailClient'
import { notFound } from 'next/navigation'

export default async function SalesInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invoice = await getSalesInvoiceById(id)

    if (!invoice) notFound()

    return <SalesInvoiceDetailClient invoice={invoice} />
}
