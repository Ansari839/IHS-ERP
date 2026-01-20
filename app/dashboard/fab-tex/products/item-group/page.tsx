import { getItemGroups } from "@/app/actions/fabtex/item-groups"
import { ItemGroupForm } from "@/components/fabtex/item-groups/item-group-form"
import { columns } from "@/components/fabtex/item-groups/item-group-columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ItemGroupPage() {
    const groups = await getItemGroups()

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Item Groups</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage hierarchical groups for your textile products.
                    </p>
                </div>

                <ItemGroupForm
                    mode="create"
                    existingGroups={groups}
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Group
                        </Button>
                    }
                />
            </div>

            <div className="bg-card rounded-xl border shadow-sm">
                <DataTable columns={columns} data={groups} />
            </div>
        </div>
    )
}
