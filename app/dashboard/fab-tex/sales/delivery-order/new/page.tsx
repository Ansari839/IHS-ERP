
export const dynamic = 'force-dynamic'

import { DeliveryOrderForm } from '@/components/fabtex/sales/delivery-order-form'
import { getSalesOrdersForDO } from '@/app/actions/fabtex/delivery-order'

export default async function NewDeliveryOrderPage() {
    const salesOrders = await getSalesOrdersForDO()

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Delivery Order</h2>
                <p className="text-muted-foreground">Issue a delivery order against an approved sales order.</p>
            </div>

            <DeliveryOrderForm salesOrders={salesOrders} />
        </div>
    )
}
