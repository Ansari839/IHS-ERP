
export const dynamic = 'force-dynamic'

import { SalesReturnForm } from '@/components/fabtex/sales/sales-return-form'
import { getReturnFormData } from '@/app/actions/fabtex/sales-return'

export default async function NewSalesReturnPage() {
    const formData = await getReturnFormData()

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Sales Return</h2>
                <p className="text-muted-foreground">Process a return from a customer.</p>
            </div>

            <SalesReturnForm {...formData} />
        </div>
    )
}
