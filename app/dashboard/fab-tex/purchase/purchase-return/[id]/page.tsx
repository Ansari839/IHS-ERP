'use server'

import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { getPurchaseReturnById } from '@/app/actions/fabtex/purchase-return'
import { Undo2, Calendar, FileText, User } from 'lucide-react'

export default async function ViewReturnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const ret = await getPurchaseReturnById(id)

    if (!ret) notFound()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <Card className="max-w-4xl mx-auto shadow-xl border-none">
                <CardHeader className="bg-red-600 text-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Undo2 className="h-8 w-8" />
                            <div>
                                <CardTitle className="text-2xl font-black uppercase tracking-tight">Purchase Return</CardTitle>
                                <p className="text-red-100 text-sm">{ret.returnNumber}</p>
                            </div>
                        </div>
                        <Badge className="bg-white text-red-600 hover:bg-red-50 font-bold px-4 py-1">
                            {ret.status}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-red-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                                <p className="font-bold">{format(new Date(ret.date), 'dd MMMM yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-red-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vendor</p>
                                <p className="font-bold">{ret.account?.name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{ret.account?.code}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-red-500 mt-1" />
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invoice Ref</p>
                                <p className="font-bold">{ret.purchaseInvoice?.invoiceNumber || 'Direct Return'}</p>
                                {ret.purchaseInvoice?.purchaseOrder && (
                                    <p className="text-xs text-muted-foreground">PO: {ret.purchaseInvoice.purchaseOrder.poNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-xl border border-red-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-red-50/50">
                                <TableRow>
                                    <TableHead className="font-bold text-red-900">Item Details</TableHead>
                                    <TableHead className="text-center font-bold text-red-900">Qty</TableHead>
                                    <TableHead className="text-right font-bold text-red-900">Rate</TableHead>
                                    <TableHead className="text-right font-bold text-red-900">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ret.items.map((item: any) => (
                                    <TableRow key={item.id} className="hover:bg-red-50/30 transition-colors">
                                        <TableCell>
                                            <div className="font-bold text-slate-800">{item.itemMaster?.name}</div>
                                            <div className="flex gap-2 text-[10px] uppercase font-bold text-slate-500 mt-1">
                                                <span>{item.color?.name}</span>
                                                <span className="text-slate-300">/</span>
                                                <span>{item.brand?.name}</span>
                                                <span className="text-slate-300">/</span>
                                                <span>{item.itemGrade?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {item.returnedQty} <span className="text-[10px] text-muted-foreground">{item.unit?.symbol}</span>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-600">
                                            {new Intl.NumberFormat('en-US').format(item.rate)}
                                        </TableCell>
                                        <TableCell className="text-right font-black text-red-600">
                                            PKR {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Remarks & Totals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="p-4 bg-muted/30 rounded-lg text-sm italic text-muted-foreground border-l-4 border-red-500">
                            <p className="not-italic font-bold text-[10px] uppercase text-red-500 mb-1">Remarks</p>
                            {ret.remarks || 'No remarks provided.'}
                        </div>
                        <div className="flex flex-col items-end gap-2 p-6 bg-red-50 rounded-xl border border-red-100 shadow-inner">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Net Return Amount</span>
                            <span className="text-4xl font-black text-red-600">
                                PKR {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(ret.totalAmount)}
                            </span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50 p-6 flex justify-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-t">
                    Printed on {format(new Date(), 'dd MMM yyyy HH:mm')} • {ret.company?.legalName || 'IHS ERP'}
                </CardFooter>
            </Card>
        </div>
    )
}
