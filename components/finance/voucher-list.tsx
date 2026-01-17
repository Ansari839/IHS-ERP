
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntry, JournalLine } from "@/types/finance.types";

interface VoucherListProps {
    entries: JournalEntry[];
}

export function VoucherList({ entries }: VoucherListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Voucher #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Narration</TableHead>
                        <TableHead className="text-right">Total Debit</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => {
                        const totalDebit = entry.lines.reduce((s: number, l: JournalLine) => s + (l.debit || 0), 0);
                        return (
                            <TableRow key={entry.id}>
                                <TableCell className="font-medium font-mono">
                                    {entry.number}
                                </TableCell>
                                <TableCell>{format(new Date(entry.date), "dd MMM yyyy")}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{entry.type}</Badge>
                                </TableCell>
                                <TableCell className="max-w-[300px] truncate">
                                    {entry.narration || "-"}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {entries.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No vouchers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
