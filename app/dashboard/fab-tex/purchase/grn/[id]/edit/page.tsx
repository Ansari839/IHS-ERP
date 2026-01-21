import { getGRNById, getPurchaseOrdersForGRN } from '@/app/actions/fabtex/grn'
import { GRNForm } from '@/components/fabtex/grn/grn-form'
import { notFound } from 'next/navigation'

export default async function EditGRNPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [grn, purchaseOrders] = await Promise.all([
        getGRNById(id),
        getPurchaseOrdersForGRN()
    ])

    if (!grn) notFound()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit GRN</h2>
            </div>
            <GRNForm purchaseOrders={purchaseOrders} initialData={grn} grnId={id} />
        </div>
    )
}
