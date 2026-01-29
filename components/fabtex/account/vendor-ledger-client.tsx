
'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface LedgerItem {
    id: number
    date: Date
    type: string
    number: string
    narration: string | null
    debit: number
    credit: number
}

interface VendorLedgerClientProps {
    account: any
    lines: LedgerItem[]
}

export function VendorLedgerClient({ account, lines }: VendorLedgerClientProps) {
    // Calculate running balance
    let runningBalance = account.openingBalanceType === 'DR' ? (account.openingBalance || 0) : -(account.openingBalance || 0);

    const transactionsWithBalance = lines.map(line => {
        // Liability Account (Vendor): Credit increases balance (positive), Debit decreases (negative)
        // Asset/Expense: Debit increases (positive), Credit decreases (negative)

        // However, a standard "Ledger" usually shows Dr/Cr and a resulting Balance.
        // Let's assume standard accounting representation: 
        // If Type is Liability: Balance = Prev + Cr - Dr

        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
            runningBalance = runningBalance + line.debit - line.credit;
        } else {
            runningBalance = runningBalance + line.credit - line.debit;
        }

        return {
            ...line,
            balance: runningBalance
        }
    })

    // Sort logic usually handled by server, but lines are already sorted by date asc

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vendor Ledger</h2>
                    <p className="text-muted-foreground font-mono">
                        {account.code} - {account.name}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/fab-tex/purchase/vendors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row justify-between items-end">
                    <CardTitle>Transactions</CardTitle>
                    <div className="text-sm font-medium">
                        Opening Balance: <span className="font-mono">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(account.openingBalance)} {account.openingBalanceType}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Voucher</TableHead>
                                <TableHead>Narration</TableHead>
                                <TableHead className="text-right text-emerald-600">Debit</TableHead>
                                <TableHead className="text-right text-red-600">Credit</TableHead>
                                <TableHead className="text-right font-bold">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="bg-muted/30">
                                <TableCell colSpan={5} className="font-medium">Opening Balance</TableCell>
                                <TableCell className="text-right font-bold font-mono">
                                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(Math.abs(account.openingBalanceType === 'DR' ? (account.openingBalance || 0) : -(account.openingBalance || 0)))}
                                    {account.openingBalanceType}
                                </TableCell>
                            </TableRow>
                            {transactionsWithBalance.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactionsWithBalance.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs">{entry.number}</span>
                                                <Badge variant="outline" className="w-fit text-[10px] px-1 py-0">{entry.type}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm" title={entry.narration || ''}>
                                            {entry.narration || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600">
                                            {entry.debit > 0 ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-red-600">
                                            {entry.credit > 0 ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold font-mono">
                                            {Math.abs(entry.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} {entry.balance >= 0 ? 'CR' : 'DR'}
                                            {/* Note: Logic above assumes CR is positive for Liability. If balance < 0, it means Debit balance (Advance) */}
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
