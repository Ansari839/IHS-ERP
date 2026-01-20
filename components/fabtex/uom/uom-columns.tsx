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
import { deleteUom } from "@/app/actions/fabtex/uom";
import { toast } from "sonner";
import { UomForm } from "./uom-form";
import { useState } from "react";

// Define the shape of our data (matching Prisma model)
export type Uom = {
    id: number;
    code: string;
    name: string;
    symbol: string;
    unitType: string;
    isBase: boolean;
    status: string;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
};

export const uomColumns: ColumnDef<Uom>[] = [
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "symbol",
        header: "Symbol",
    },
    {
        accessorKey: "unitType",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline">
                {row.getValue("unitType")}
            </Badge>
        ),
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
            const uom = row.original;
            const [showEditDialog, setShowEditDialog] = useState(false);

            const handleDelete = async () => {
                const result = await deleteUom(uom.id);
                if (result.success) {
                    toast.success("Unit deleted successfully");
                } else {
                    toast.error(result.error || "Failed to delete unit");
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

                    <UomForm
                        mode="edit"
                        defaultValues={uom}
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                    />
                </>
            );
        },
    },
];
