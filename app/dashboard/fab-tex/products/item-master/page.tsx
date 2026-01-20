import { Suspense } from "react";
import { getItemMasters } from "@/app/actions/fabtex/item-master";
import { getItemGroups } from "@/app/actions/fabtex/item-groups";
import { getUoms } from "@/app/actions/fabtex/uom";
import { ItemMasterClient } from "@/components/fabtex/item-master/item-master-client";
import { ItemMasterForm } from "@/components/fabtex/item-master/item-master-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function ItemMasterList() {
    const [data, itemGroups, units] = await Promise.all([
        getItemMasters(),
        getItemGroups(),
        getUoms()
    ]);

    // Transform dates to strings or keep as Date if Client Component handles it. 
    // ItemMaster type in columns expects Date for createdAt/updatedAt, so passing directly is fine 
    // IF the data comes from Server Actions which might serialize Dates.
    // However, in Next.js Server Components -> Client Components, Dates need to be serializable (strings or numbers) usually, 
    // OR we rely on the fact that we are calling server action directly in component? 
    // No, we are calling server actions in Server Component, so data is passed as props. 
    // Props must be serializable. Dates are NOT serializable by default in Next.js props unless using a library or converting.
    // The ItemMaster type in columns.tsx usage might need adjustment if passed over boundary. 
    // Let's assume for now we pass them as is, but if error persists ("Warning: Only plain objects..."), we map.

    // Actually, getItemMasters returns Prisma objects.
    // Let's ensure we map if needed. For now, let's try direct pass.

    // Correction: `getItemMasterColumns` function is the issue. 
    // We moved the call to `ItemMasterClient` which is a Client Component.

    return (
        <ItemMasterClient
            data={data as any}
            itemGroups={itemGroups}
            units={units}
        />
    );
}

async function ItemMasterHeader() {
    const [itemGroups, units] = await Promise.all([
        getItemGroups(),
        getUoms()
    ]);

    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Item Master</h2>
                <p className="text-muted-foreground">
                    Manage master items for production.
                </p>
            </div>
            <ItemMasterForm itemGroups={itemGroups} units={units} />
        </div>
    )
}

export default function ItemMasterPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                <ItemMasterHeader />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ItemMasterList />
            </Suspense>
        </div>
    );
}
