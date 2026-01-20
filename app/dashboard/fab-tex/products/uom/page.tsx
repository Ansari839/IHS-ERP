import { Suspense } from "react";
import { getUoms } from "@/app/actions/fabtex/uom";
import { getConversions } from "@/app/actions/fabtex/conversions";
import { uomColumns } from "@/components/fabtex/uom/uom-columns";
import { conversionColumns } from "@/components/fabtex/conversions/conversion-columns";
import { DataTable } from "@/components/ui/data-table";
import { UomForm } from "@/components/fabtex/uom/uom-form";
import { ConversionForm } from "@/components/fabtex/conversions/conversion-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

async function UomContent() {
    const [uoms, conversions] = await Promise.all([
        getUoms(),
        getConversions()
    ]);

    return (
        <Tabs defaultValue="units" className="space-y-4">
            <TabsList>
                <TabsTrigger value="units">Units</TabsTrigger>
                <TabsTrigger value="conversions">Conversions</TabsTrigger>
            </TabsList>

            <TabsContent value="units" className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Units</h2>
                        <p className="text-sm text-muted-foreground">
                            Define base and derived units.
                        </p>
                    </div>
                    <UomForm />
                </div>
                <DataTable
                    columns={uomColumns}
                    data={uoms}
                    searchKey="name"
                />
            </TabsContent>

            <TabsContent value="conversions" className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Conversion Rules</h2>
                        <p className="text-sm text-muted-foreground">
                            Define how units convert to each other (e.g. 1 Dozen = 12 Pieces).
                        </p>
                    </div>
                    <ConversionForm units={uoms} />
                </div>
                <DataTable
                    columns={conversionColumns}
                    data={conversions}
                    searchKey="toUnitName" // Not ideal searching but DataTable expects string accessor. Better to support custom filter or just use 'toUnit' if flattened. 
                // Actually 'toUnit.name' works if accessorKey is set correctly in column def or if data is nested. 
                // My column def uses accessorKey: "toUnit.name" which TanStack table supports.
                />
            </TabsContent>
        </Tabs>
    );
}

export default function UomPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Units & Conversions</h2>
                    <p className="text-muted-foreground">
                        Manage measurement units and their conversion rates.
                    </p>
                </div>
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <UomContent />
            </Suspense>
        </div>
    );
}
