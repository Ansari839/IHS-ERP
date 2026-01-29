
export const dynamic = 'force-dynamic'

import { DeliveryOrderForm } from '@/components/fabtex/sales/delivery-order-form'
import { getDOFormData } from '@/app/actions/fabtex/delivery-order'

export default async function NewDeliveryOrderPage() {
    const formData = await getDOFormData()

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Delivery Order</h2>
                <p className="text-muted-foreground">Issue a delivery order against an SO or directly to a customer.</p>
            </div>

            <DeliveryOrderForm {...formData} />
        </div>
    )
}
