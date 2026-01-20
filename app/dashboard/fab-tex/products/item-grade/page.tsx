import { Suspense } from "react";
import { getItemGrades } from "@/app/actions/fabtex/item-grades";
import { itemGradeColumns } from "@/components/fabtex/item-grades/item-grade-columns";
import { DataTable } from "@/components/ui/data-table";
import { ItemGradeForm } from "@/components/fabtex/item-grades/item-grade-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function ItemGradeList() {
    const data = await getItemGrades();

    return (
        <DataTable
            columns={itemGradeColumns}
            data={data}
            searchKey="name"
        />
    );
}

export default function ItemGradePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Item Grades</h2>
                    <p className="text-muted-foreground">
                        Manage item grades (e.g., A-Grade, B-Grade).
                    </p>
                </div>
                <ItemGradeForm />
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ItemGradeList />
            </Suspense>
        </div>
    );
}
