import { getPurchaseOrdersForGRN } from '@/app/actions/fabtex/grn'
import { GRNForm } from '@/components/fabtex/grn/grn-form'

export default async function CreateGRNPage() {
    const purchaseOrders = await getPurchaseOrdersForGRN()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create GRN</h2>
            </div>
            <GRNForm purchaseOrders={purchaseOrders} />
        </div>
    )
}
