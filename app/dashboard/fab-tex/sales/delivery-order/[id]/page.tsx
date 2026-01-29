import { getDeliveryOrderById } from '@/app/actions/fabtex/delivery-order'
import DeliveryOrderDetailClient from '@/components/fabtex/sales/DeliveryOrderDetailClient'
import { notFound } from 'next/navigation'

export default async function DODetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const doItem = await getDeliveryOrderById(id)

    if (!doItem) notFound()

    return <DeliveryOrderDetailClient deliveryOrder={doItem} />
}
