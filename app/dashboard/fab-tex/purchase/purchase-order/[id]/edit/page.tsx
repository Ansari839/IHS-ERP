
import { PurchaseOrderForm } from '@/components/fabtex/purchase-order/purchase-order-form'
import { getItemMasters } from '@/app/actions/fabtex/item-master'
import { getColors } from '@/app/actions/fabtex/colors'
import { getBrands } from '@/app/actions/fabtex/brands'
import { getItemGrades } from '@/app/actions/fabtex/item-grades'
import { getUoms } from '@/app/actions/fabtex/uom'
import { getWarehouses } from '@/app/actions/warehouses'
import { getPurchaseOrderById } from '@/app/actions/fabtex/purchase-order'
import { getPackingUnits } from '@/app/actions/fabtex/packing-unit'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface EditPOPageProps {
    params: Promise<{ id: string }>
}

export default async function EditPurchaseOrderPage({ params }: EditPOPageProps) {
    const resolvedParams = await params
    const poId = resolvedParams.id

    console.log('EditPOPage: poId =', poId)

    const [initialData, items, colors, brands, itemGrades, units, warehouses, packingUnits] = await Promise.all([
        getPurchaseOrderById(poId),
        getItemMasters(),
        getColors(),
        getBrands(),
        getItemGrades(),
        getUoms(),
        getWarehouses(),
        getPackingUnits()
    ])

    if (!initialData) {
        notFound()
    }

    const accounts = await prisma.account.findMany({
        where: { isPosting: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Purchase Order</h2>
                <p className="text-muted-foreground">Update details for {initialData.poNumber}.</p>
            </div>

            <PurchaseOrderForm
                initialData={initialData as any}
                items={items}
                colors={colors}
                brands={brands}
                itemGrades={itemGrades}
                units={units}
                warehouses={warehouses}
                accounts={accounts}
                packingUnits={packingUnits}
            />
        </div>
    )
}
