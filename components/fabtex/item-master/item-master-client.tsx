"use client";

import { getItemMasterColumns, ItemMaster } from "./item-master-columns";
import { DataTable } from "@/components/ui/data-table";

interface ItemMasterClientProps {
    data: ItemMaster[];
    itemGroups: any[];
    units: any[];
}

export function ItemMasterClient({ data, itemGroups, units }: ItemMasterClientProps) {
    const columns = getItemMasterColumns(itemGroups, units);

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="name"
        />
    );
}
