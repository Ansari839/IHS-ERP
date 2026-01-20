import { Suspense } from "react";
import { getColors } from "@/app/actions/fabtex/colors";
import { colorColumns } from "@/components/fabtex/colors/color-columns";
import { DataTable } from "@/components/ui/data-table";
import { ColorForm } from "@/components/fabtex/colors/color-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function ColorList() {
    const data = await getColors();

    return (
        <DataTable
            columns={colorColumns}
            data={data}
            searchKey="name"
        />
    );
}

export default function ColorsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Colors</h2>
                    <p className="text-muted-foreground">
                        Manage your product colors and their codes.
                    </p>
                </div>
                <ColorForm />
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ColorList />
            </Suspense>
        </div>
    );
}
