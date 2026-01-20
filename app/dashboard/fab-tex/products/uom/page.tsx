import { Suspense } from "react";
import { getUoms } from "@/app/actions/fabtex/uom";
import { uomColumns } from "@/components/fabtex/uom/uom-columns";
import { DataTable } from "@/components/ui/data-table";
import { UomForm } from "@/components/fabtex/uom/uom-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function UomList() {
    const data = await getUoms();

    return (
        <DataTable
            columns={uomColumns}
            data={data}
            searchKey="name"
        />
    );
}

export default function UomPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Units of Measurement</h2>
                    <p className="text-muted-foreground">
                        Manage measurement units (e.g., kg, meter, pieces).
                    </p>
                </div>
                <UomForm />
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <UomList />
            </Suspense>
        </div>
    );
}
