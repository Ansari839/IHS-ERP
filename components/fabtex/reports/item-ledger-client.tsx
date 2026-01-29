
'use client'

import { LedgerEntry } from "@/app/actions/fabtex/stock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ItemLedgerClientProps {
    entries: LedgerEntry[]
    itemName: string
    itemCode: string
}

export function ItemLedgerClient({ entries, itemName, itemCode }: ItemLedgerClientProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Stock Ledger: {itemName}</h2>
                    <p className="text-muted-foreground">
                        Detailed transaction history for {itemCode}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/fab-tex/reports/stock">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Summary
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Document No</TableHead>
                                <TableHead>Party</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead className="text-right text-emerald-600">Qty In</TableHead>
                                <TableHead className="text-right text-red-600">Qty Out</TableHead>
                                <TableHead className="text-right font-bold">Balance</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={entry.type === 'GRN' ? 'default' : 'destructive'}>
                                                {entry.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{entry.documentNo}</TableCell>
                                        <TableCell>{entry.partyName}</TableCell>
                                        <TableCell>{entry.warehouseName || '-'}</TableCell>
                                        <TableCell className="text-right text-emerald-600 font-medium">
                                            {entry.qtyIn > 0 ? entry.qtyIn.toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600 font-medium">
                                            {entry.qtyOut > 0 ? entry.qtyOut.toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {entry.balance.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                            {entry.remarks}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
