
import { getSalesReturnById } from '@/app/actions/fabtex/sales-return'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PrintButton } from '@/components/ui/print-button'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export default async function ReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const returnItem = await getSalesReturnById(id)

    if (!returnItem) notFound()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">Return Preview</h2>
                <PrintButton />
            </div>

            <Card className="print:border-none print:shadow-none bg-white">
                <CardHeader className="border-b mb-6 print:pb-8 bg-red-50/50">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            {returnItem.company?.logoUrl && (
                                <img src={returnItem.company.logoUrl} alt="Logo" className="h-12 mb-4 object-contain" />
                            )}
                            <h3 className="text-2xl font-bold">{returnItem.company?.legalName || 'Company Name'}</h3>
                            <p className="text-sm text-muted-foreground">{returnItem.company?.address}</p>
                            <p className="text-sm text-muted-foreground">{returnItem.company?.email} | {returnItem.company?.phone}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <h2 className="text-2xl font-bold text-red-600 tracking-widest uppercase">Credit Note</h2>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Return #:</span>
                                <span className="font-bold ml-2 text-lg">{returnItem.returnNumber}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium ml-2">{format(new Date(returnItem.date), 'dd MMMM yyyy')}</span>
                            </div>
                            {returnItem.salesInvoice && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Ref Invoice:</span>
                                    <span className="font-medium ml-2">{returnItem.salesInvoice.invoiceNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-red-600 mb-2 border-b border-red-200">Customer</h4>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{returnItem.account?.name || 'Customer'}</p>
                                <p className="text-sm">{returnItem.account?.description || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden border-red-100">
                        <Table>
                            <TableHeader className="bg-red-950 text-red-50">
                                <TableRow className="hover:bg-red-950">
                                    <TableHead className="text-red-50">Item Description</TableHead>
                                    <TableHead className="text-right text-red-50">Return Qty</TableHead>
                                    <TableHead className="text-right text-red-50">Rate</TableHead>
                                    <TableHead className="text-right text-red-50">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returnItem.items.map((item: any) => (
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
                                            {item.returnedQty} {item.unit?.symbol || 'kg'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.rate)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">
                                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between items-center py-2 border-t border-b border-double border-red-200">
                                <span className="font-bold text-lg text-red-900">Total Credit</span>
                                <span className="font-bold text-xl text-red-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(returnItem.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {returnItem.remarks && (
                        <div className="pt-8">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Remarks</h4>
                            <p className="text-sm italic">{returnItem.remarks}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="hidden print:flex justify-between items-end mt-24 px-8 pt-12">
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Prepared By</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Store Incharge</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Approved By</div>
            </div>
        </div>
    )
}
