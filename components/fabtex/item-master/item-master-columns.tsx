"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { deleteItemMaster } from "@/app/actions/fabtex/item-master";
import { toast } from "sonner";
import { ItemMasterForm } from "./item-master-form";
import { useState } from "react";
import Image from "next/image";

export type ItemMaster = {
    id: string;
    code: string;
    name: string;
    shortDescription: string | null;
    status: string;
    hsCode: string | null;
    imageUrl: string | null;
    itemGroupId: string;
    baseUnitId: number;
    companyId: number;
    itemGroup: { name: string };
    baseUnit: { name: string; symbol: string };
    createdAt: Date;
    updatedAt: Date;
};

// We need to pass lists for dropdowns to the edit form
export const getItemMasterColumns = (itemGroups: any[], units: any[]): ColumnDef<ItemMaster>[] => [
    {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => {
            const url = row.getValue("imageUrl") as string;
            if (!url) return <div className="w-10 h-10 bg-muted rounded-md" />;
            return (
                <div className="relative w-10 h-10 overflow-hidden rounded-md border">
                    <Image src={url} alt={row.getValue("name")} fill className="object-cover" />
                </div>
            );
        },
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "itemGroup.name",
        header: "Group",
    },
    {
        accessorKey: "baseUnit.symbol",
        header: "Unit",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original;
            const [showEditDialog, setShowEditDialog] = useState(false);

            const handleDelete = async () => {
                const result = await deleteItemMaster(item.id);
                if (result.success) {
                    toast.success("Item deleted successfully");
                } else {
                    toast.error(result.error || "Failed to delete item");
                }
            };

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => setShowEditDialog(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-red-600"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ItemMasterForm
                        mode="edit"
                        defaultValues={item}
                        itemGroups={itemGroups}
                        units={units}
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                    />
                </>
            );
        },
    },
];
