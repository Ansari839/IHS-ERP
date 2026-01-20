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
import { deleteItemGrade } from "@/app/actions/fabtex/item-grades";
import { toast } from "sonner";
import { ItemGradeForm } from "./item-grade-form";
import { useState } from "react";

export type ItemGrade = {
    id: string;
    code: string;
    name: string;
    status: string;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
};

export const itemGradeColumns: ColumnDef<ItemGrade>[] = [
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "name",
        header: "Name",
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
            const grade = row.original;
            const [showEditDialog, setShowEditDialog] = useState(false);

            const handleDelete = async () => {
                const result = await deleteItemGrade(grade.id);
                if (result.success) {
                    toast.success("Grade deleted successfully");
                } else {
                    toast.error(result.error || "Failed to delete grade");
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

                    <ItemGradeForm
                        mode="edit"
                        defaultValues={grade}
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                    />
                </>
            );
        },
    },
];
