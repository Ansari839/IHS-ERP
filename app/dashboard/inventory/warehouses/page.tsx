// Since I can't easily create a NEW file and refactor everything in one go cleanly without risk,
// I will create `WarehouseClient` and move the UI there.

// ACTUALLY, simpler approach for now to fix user immediate issue without massive refactor:
// I will keep `page.tsx` as Server Component.
// I'll make the "Add Button + Dialog" a separate Client Component `<AddWarehouseDialog />`.
// I'll make the "Edit Button + Dialog" a separate Client Component `<EditWarehouseDialog />` (or key existing one).
// But for the Table Columns, I can just add them here.
// The user complained "Navigate nahi hua". If I keep it uncontrolled, router.refresh() updates data, but Dialog stays open.
// I MUST control the dialog.

// Strategy:
// 1. Create `components/warehouses/warehouse-list-client.tsx` (Client Component)
//    - Props: initialWarehouses (passed from server page)
//    - Contains: The Heading, Add Button (Controlled Dialog), and Table with Edit Buttons (Controlled Dialogs).
// 2. Update `page.tsx` to fetch data and render `WarehouseListClient`.

import { WarehouseListClient } from '@/components/warehouses/warehouse-list-client'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function WarehousesPage() {
    const warehouses = await prisma.warehouse.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return <WarehouseListClient initialData={warehouses} />
}
