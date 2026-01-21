import { getPurchaseInvoices } from '@/app/actions/fabtex/purchase-invoice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default async function InvoiceListPage() {
    const invoices = await getPurchaseInvoices()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Invoices</h2>
                <Button asChild>
                    <Link href="/dashboard/fab-tex/purchase/invoice/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                                        <TableCell>{format(new Date(inv.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{inv.purchaseOrder.poNumber}</TableCell>
                                        <TableCell>{inv.purchaseOrder.account?.name || inv.purchaseOrder.partyName || '-'}</TableCell>
                                        <TableCell className="font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(inv.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>
                                                {inv.status}
                                            </Badge>
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
