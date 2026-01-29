
import { getSalesReturnById, getReturnFormData } from "@/app/actions/fabtex/sales-return"
import { SalesReturnForm } from "@/components/fabtex/sales/sales-return-form"
import { notFound } from "next/navigation"

export default async function EditSalesReturnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [returnItem, formData] = await Promise.all([
        getSalesReturnById(id),
        getReturnFormData()
    ])

    if (!returnItem) {
        return notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <SalesReturnForm
                initialData={returnItem}
                {...formData}
            />
        </div>
    )
}
