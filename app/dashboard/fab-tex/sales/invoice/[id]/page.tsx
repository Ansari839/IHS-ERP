
import { getSalesInvoiceById } from '@/app/actions/fabtex/sales-invoice'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PrintButton } from '@/components/ui/print-button'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export default async function SalesInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invoice = await getSalesInvoiceById(id)

    if (!invoice) notFound()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">Sales Invoice Preview</h2>
                <PrintButton />
            </div>

            <Card className="print:border-none print:shadow-none bg-white">
                <CardHeader className="border-b mb-6 print:pb-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            {invoice.company?.logoUrl && (
                                <img src={invoice.company.logoUrl} alt="Logo" className="h-12 mb-4 object-contain" />
                            )}
                            <h3 className="text-2xl font-bold">{invoice.company?.legalName || 'Company Name'}</h3>
                            <p className="text-sm text-muted-foreground">{invoice.company?.address}</p>
                            <p className="text-sm text-muted-foreground">{invoice.company?.email} | {invoice.company?.phone}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <h2 className="text-3xl font-bold text-primary tracking-widest uppercase">Invoice</h2>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Invoice No:</span>
                                <span className="font-bold ml-2 text-lg">{invoice.invoiceNumber}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium ml-2">{format(new Date(invoice.date), 'dd MMMM yyyy')}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={`font-bold ml-2 ${invoice.status === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>{invoice.status}</span>
                            </div>
                            {invoice.salesOrder && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">SO Ref:</span>
                                    <span className="font-medium ml-2">{invoice.salesOrder.soNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Bill To</h4>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{invoice.account?.name || invoice.salesOrder?.account?.name || 'Cash Customer'}</p>
                                <p className="text-sm">{invoice.account?.description || invoice.salesOrder?.account?.description || '-'}</p>
                            </div>
                        </div>
                        <div>
                            {/* Additional Info like Segment or Terms */}
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-950 text-slate-50">
                                <TableRow className="hover:bg-slate-950">
                                    <TableHead className="text-slate-50">Item Description</TableHead>
                                    <TableHead className="text-right text-slate-50">Qty</TableHead>
                                    <TableHead className="text-right text-slate-50">Rate</TableHead>
                                    <TableHead className="text-right text-slate-50">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item: any) => (
                                    <TableRow key={item.id} className="print:break-inside-avoid">
                                        <TableCell>
                                            <div className="font-bold">{item.itemMaster.name}</div>
                                            <div className="text-xs text-muted-foreground space-x-2">
                                                {item.brand && <span>{item.brand.name}</span>}
                                                {item.color && <span>{item.color.name}</span>}
                                                {item.itemGrade && <span>{item.itemGrade.name}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {item.invoicedQty} {item.unit?.symbol || 'kg'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.rate)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between items-center py-2 border-t border-b border-double border-primary/20">
                                <span className="font-bold text-lg">Total Amount</span>
                                <span className="font-bold text-xl text-primary">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(invoice.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {invoice.remarks && (
                        <div className="pt-8">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Remarks</h4>
                            <p className="text-sm italic">{invoice.remarks}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="hidden print:flex justify-between items-end mt-24 px-8 pt-12">
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Prepared By</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Approved By</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Received By</div>
            </div>
        </div>
    )
}
