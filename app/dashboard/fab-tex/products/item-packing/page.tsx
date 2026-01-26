import { Suspense } from "react";
import { getPackingUnits } from "@/app/actions/fabtex/packing-unit";
import { packingUnitColumns } from "@/components/fabtex/packing-units/packing-unit-columns";
import { DataTable } from "@/components/ui/data-table";
import { PackingUnitForm } from "@/components/fabtex/packing-units/packing-unit-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function PackingUnitList() {
    const data = await getPackingUnits();

    return (
        <DataTable
            columns={packingUnitColumns}
            data={data}
            searchKey="name"
        />
    );
}

export default function ItemPackingPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Packing Units</h2>
                    <p className="text-muted-foreground">
                        Manage packing types (Bales, Cartons, Rolls).
                    </p>
                </div>
                <PackingUnitForm />
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <PackingUnitList />
            </Suspense>
        </div>
    );
}
