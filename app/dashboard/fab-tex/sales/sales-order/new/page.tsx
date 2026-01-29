
export const dynamic = 'force-dynamic'

import { SalesOrderForm } from '@/components/fabtex/sales/sales-order-form'
import { getItemMasters } from '@/app/actions/fabtex/item-master'
import { getColors } from '@/app/actions/fabtex/colors'
import { getBrands } from '@/app/actions/fabtex/brands'
import { getItemGrades } from '@/app/actions/fabtex/item-grades'
import { getUoms } from '@/app/actions/fabtex/uom'
import { getWarehouses } from '@/app/actions/warehouses'
import { getPackingUnits } from '@/app/actions/fabtex/packing-unit'
import prisma from '@/lib/prisma'

export default async function NewSalesOrderPage() {
    const [items, colors, brands, itemGrades, units, warehouses, packingUnits] = await Promise.all([
        getItemMasters(),
        getColors(),
        getBrands(),
        getItemGrades(),
        getUoms(),
        getWarehouses(),
        getPackingUnits()
    ])

    // Fetch posting accounts (Customers)
    const accounts = await prisma.account.findMany({
        where: { isPosting: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Sales Order</h2>
                <p className="text-muted-foreground">Add a new local or export sales order.</p>
            </div>

            <SalesOrderForm
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
