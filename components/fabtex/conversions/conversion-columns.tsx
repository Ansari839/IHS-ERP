"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteConversion } from "@/app/actions/fabtex/conversions";
import { toast } from "sonner";
import { Uom } from "../uom/uom-columns"; // Import Uom type from existing file

export type Conversion = {
    id: number;
    fromUnitId: number;
    toUnitId: number;
    conversionRate: number;
    companyId: number;
    fromUnit: Uom;
    toUnit: Uom;
};

export const conversionColumns: ColumnDef<Conversion>[] = [
    {
        accessorKey: "fromUnit.name",
        header: "From Unit",
        cell: ({ row }) => {
            const unit = row.original.fromUnit;
            return <span>{unit.name} ({unit.symbol})</span>;
        }
    },
    {
        accessorKey: "conversionRate",
        header: "Rate",
        cell: ({ row }) => <span className="font-mono">x {row.original.conversionRate}</span>
    },
    {
        accessorKey: "toUnit.name",
        id: "toUnitName",
        header: "To Unit",
        cell: ({ row }) => {
            const unit = row.original.toUnit;
            return <span>{unit.name} ({unit.symbol})</span>;
        }
    },
    {
        id: "display",
        header: "Equation",
        cell: ({ row }) => {
            const c = row.original;
            return <span className="text-muted-foreground italic">1 {c.fromUnit.symbol} = {c.conversionRate} {c.toUnit.symbol}</span>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const conversion = row.original;

            const handleDelete = async () => {
                const result = await deleteConversion(conversion.id);
                if (result.success) {
                    toast.success("Conversion rule deleted");
                } else {
                    toast.error(result.error || "Failed to delete rule");
                }
            };

            return (
                <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600">
                    <Trash className="h-4 w-4" />
                </Button>
            );
        },
    },
];
