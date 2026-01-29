import { WarehouseListClient } from '@/components/warehouses/warehouse-list-client'
import { getWarehouses } from '@/app/actions/warehouses'

export const dynamic = 'force-dynamic'

export default async function FabTexWarehousesPage() {
    // Fetch only YARN warehouses
    const warehouses = await getWarehouses('YARN')

    return (
        <div className="p-8">
            <WarehouseListClient
                initialData={warehouses}
                segment="YARN"
            />
        </div>
    )
}
