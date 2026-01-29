import { getPurchaseInvoices } from '@/app/actions/fabtex/purchase-invoice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DeleteInvoiceButton } from '@/components/fabtex/purchase-invoice/delete-button'

export default async function InvoiceListPage() {
    const invoices = await getPurchaseInvoices('YARN')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Invoices</h2>
                <Button asChild className="rounded-full shadow-lg">
                    <Link href="/dashboard/fab-tex/purchase/invoice/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Link>
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-background/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Invoice Registry
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                <TableHead className="font-bold">Invoice Ref</TableHead>
                                <TableHead className="font-bold">Supplier Inv #</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">PO Number</TableHead>
                                <TableHead className="font-bold">Vendor</TableHead>
                                <TableHead className="font-bold text-right">Amount</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 opacity-20" />
                                            <span>No invoices found. Post your first invoice!</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((inv) => (
                                    <TableRow key={inv.id} className="hover:bg-primary/5 transition-colors group">
                                        <TableCell className="font-bold text-primary">{inv.invoiceNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-[10px] bg-background">
                                                {inv.supplierInvoiceNo || '-'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{format(new Date(inv.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            {inv.purchaseOrder ? (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                    {inv.purchaseOrder.poNumber}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground border-dashed">
                                                    DIRECT
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {inv.purchaseOrder?.account?.name || inv.account?.name || inv.purchaseOrder?.partyName || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(inv.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`rounded-full px-3 ${inv.status === 'PAID'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                    }`}
                                            >
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button asChild variant="ghost" size="icon" className="rounded-full shadow-sm bg-background border border-primary/10">
                                                    <Link href={`/dashboard/fab-tex/purchase/invoice/${inv.id}/view`}>
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="ghost" size="icon" className="rounded-full shadow-sm bg-background border border-primary/10">
                                                    <Link href={`/dashboard/fab-tex/purchase/invoice/${inv.id}/edit`}>
                                                        <Edit className="w-4 h-4 text-primary" />
                                                    </Link>
                                                </Button>
                                                <DeleteInvoiceButton id={inv.id} invoiceNumber={inv.invoiceNumber} />
                                            </div>
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

