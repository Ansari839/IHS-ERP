"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { deleteItemGroup } from "@/app/actions/fabtex/item-groups"
import { toast } from "sonner"
import { ItemGroupForm } from "./item-group-form"

// Define the type based on Prisma model
export type ItemGroup = {
    id: string
    code: string
    name: string
    description: string | null
    status: string
    parentId: string | null
    parent?: {
        name: string
    } | null
    _count?: {
        children: number
    }
}

export const columns: ColumnDef<ItemGroup>[] = [
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("code")}</span>,
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "parent.name",
        header: "Parent Group",
        cell: ({ row }) => row.original.parent?.name || <span className="text-muted-foreground italic">Root</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell group={row.original} />
    },
]

function ActionCell({ group }: { group: ItemGroup }) {
    const [editOpen, setEditOpen] = useState(false);

    const handleDelete = async () => {
        if (group._count && group._count.children > 0) {
            toast.error("Cannot delete group with children.");
            return;
        }

        toast.promise(deleteItemGroup(group.id), {
            loading: 'Deleting...',
            success: (data) => {
                if (data.success) return 'Group deleted';
                throw new Error(data.error);
            },
            error: (err) => err.message
        });
    }

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
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {editOpen && (
                <ItemGroupForm
                    mode="edit"
                    defaultValues={group}
                    existingGroups={[]}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}
        </>
    )
}
