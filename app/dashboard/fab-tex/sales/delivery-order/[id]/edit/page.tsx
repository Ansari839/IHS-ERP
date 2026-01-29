
import { DeliveryOrderForm } from '@/components/fabtex/sales/delivery-order-form'
import { getDeliveryOrderById, getSalesOrdersForDO } from '@/app/actions/fabtex/delivery-order'
import { notFound } from 'next/navigation'

interface EditDOPageProps {
    params: Promise<{ id: string }>
}

export default async function EditDOPage({ params }: EditDOPageProps) {
    const resolvedParams = await params
    const doId = resolvedParams.id

    const [doItem, salesOrders] = await Promise.all([
        getDeliveryOrderById(doId),
        getSalesOrdersForDO()
    ])

    if (!doItem) {
        notFound()
    }

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Delivery Order</h2>
                <p className="text-muted-foreground">Update details for {doItem.doNumber}.</p>
            </div>

            <DeliveryOrderForm salesOrders={salesOrders} initialData={doItem as any} doId={doId} />
        </div>
    )
}
