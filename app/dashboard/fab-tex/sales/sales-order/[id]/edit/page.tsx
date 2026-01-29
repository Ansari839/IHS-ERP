
import { SalesOrderForm } from '@/components/fabtex/sales/sales-order-form'
import { getItemMasters } from '@/app/actions/fabtex/item-master'
import { getColors } from '@/app/actions/fabtex/colors'
import { getBrands } from '@/app/actions/fabtex/brands'
import { getItemGrades } from '@/app/actions/fabtex/item-grades'
import { getUoms } from '@/app/actions/fabtex/uom'
import { getWarehouses } from '@/app/actions/warehouses'
import { getSalesOrderById } from '@/app/actions/fabtex/sales-order'
import { getPackingUnits } from '@/app/actions/fabtex/packing-unit'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface EditSOPageProps {
    params: Promise<{ id: string }>
}

export default async function EditSalesOrderPage({ params }: EditSOPageProps) {
    const resolvedParams = await params
    const soId = resolvedParams.id

    const [initialData, items, colors, brands, itemGrades, units, warehouses, packingUnits] = await Promise.all([
        getSalesOrderById(soId),
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
                <h2 className="text-3xl font-bold tracking-tight">Edit Sales Order</h2>
                <p className="text-muted-foreground">Update details for {initialData.soNumber}.</p>
            </div>

            <SalesOrderForm
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
