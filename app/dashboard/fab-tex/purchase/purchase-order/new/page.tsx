
export const dynamic = 'force-dynamic'

import { PurchaseOrderForm } from '@/components/fabtex/purchase-order/purchase-order-form'
import { getItemMasters } from '@/app/actions/fabtex/item-master'
import { getColors } from '@/app/actions/fabtex/colors'
import { getBrands } from '@/app/actions/fabtex/brands'
import { getItemGrades } from '@/app/actions/fabtex/item-grades'
import { getUoms } from '@/app/actions/fabtex/uom'
import { getWarehouses } from '@/app/actions/warehouses'
import { getPackingUnits } from '@/app/actions/fabtex/packing-unit'
import prisma from '@/lib/prisma'

export default async function NewPurchaseOrderPage() {
    const [items, colors, brands, itemGrades, units, warehouses, packingUnits] = await Promise.all([
        getItemMasters(),
        getColors(),
        getBrands(),
        getItemGrades(),
        getUoms(),
        getWarehouses(),
        getPackingUnits()
    ])

    // For accounts, we'll fetch posting accounts (Vendors usually fall under Liabilities/Assets depending on accounting setup)
    // For now, fetching all posting accounts
    const accounts = await prisma.account.findMany({
        where: { isPosting: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Purchase Order</h2>
                <p className="text-muted-foreground">Add a new local or import purchase order.</p>
            </div>

            <PurchaseOrderForm
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
