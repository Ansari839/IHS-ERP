import { Suspense } from "react";
import { getBrands } from "@/app/actions/fabtex/brands";
import { brandColumns } from "@/components/fabtex/brands/brand-columns";
import { DataTable } from "@/components/ui/data-table";
import { BrandForm } from "@/components/fabtex/brands/brand-form";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function BrandList() {
    const data = await getBrands();

    return (
        <DataTable
            columns={brandColumns}
            data={data}
            searchKey="name"
        />
    );
}

export default function BrandsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
                    <p className="text-muted-foreground">
                        Manage your product brands.
                    </p>
                </div>
                <BrandForm />
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <BrandList />
            </Suspense>
        </div>
    );
}
