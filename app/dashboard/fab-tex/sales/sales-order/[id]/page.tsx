
import { getSalesOrderById } from '@/app/actions/fabtex/sales-order'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PrintButton } from '@/components/ui/print-button'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export default async function SODetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const so = await getSalesOrderById(id)

    if (!so) notFound()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">Sales Order Preview</h2>
                <PrintButton />
            </div>

            <Card className="print:border-none print:shadow-none">
                <CardHeader className="border-b mb-6 print:pb-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            {so.company?.logoUrl && (
                                <img src={so.company.logoUrl} alt="Logo" className="h-12 mb-4 object-contain" />
                            )}
                            <h3 className="text-2xl font-bold">{so.company?.legalName || 'Company Name'}</h3>
                            <p className="text-sm text-muted-foreground">{so.company?.address}</p>
                            <p className="text-sm text-muted-foreground">{so.company?.email} | {so.company?.phone}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge variant="outline" className="text-lg px-4 py-1">{so.status}</Badge>
                            <div className="text-sm">
                                <span className="text-muted-foreground">SO Number:</span>
                                <span className="font-bold ml-2">{so.soNumber}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium ml-2">{format(new Date(so.createdAt), 'dd MMMM yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Customer Details</h4>
                            <div className="space-y-1">
                                <p className="font-bold">{so.account?.name || so.partyName}</p>
                                <p className="text-sm">{so.account?.description || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Dispatch From</h4>
                            <div className="space-y-1">
                                <p className="font-bold">{so.warehouse?.name || 'Central Warehouse'}</p>
                                <p className="text-sm">{so.warehouse?.location || so.company?.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 text-sm">
                        <div>
                            <p className="text-muted-foreground">Order Type</p>
                            <p className="font-medium">{so.type}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">File No</p>
                            <p className="font-medium">{so.fileNo || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Reference</p>
                            <p className="font-medium">{so.referenceNo || '-'}</p>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Item & Description</TableHead>
                                    <TableHead>Specification</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead className="text-right">Total (PKR)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {so.items.map((item: any, idx: number) => (
                                    <TableRow key={item.id} className="print:break-inside-avoid">
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-bold">{item.itemMaster.name}</div>
                                            {item.remarks && <p className="text-xs text-muted-foreground mt-1">{item.remarks}</p>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs space-y-0.5">
                                                {item.color && <div>Color: {item.color.name}</div>}
                                                {item.brand && <div>Brand: {item.brand.name}</div>}
                                                {item.itemGrade && <div>Grade: {item.itemGrade.name}</div>}
                                                {item.packingType && (
                                                    <div>
                                                        Packing: {item.packingType} ({item.pcs} {item.packingUnit?.symbol || item.packingUnit?.name || item.itemMaster?.packingUnit?.symbol || item.itemMaster?.packingUnit?.name || 'Pkgs'})
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {item.quantity} {item.unit?.symbol}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('en-US').format(item.rate)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {new Intl.NumberFormat('en-US').format(item.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <div className="w-[300px] space-y-2 border-t pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-primary">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(so.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {so.remarks && (
                        <div className="pt-8 mt-8 border-t border-dashed">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Terms & Conditions / Remarks</h4>
                            <p className="text-sm">{so.remarks}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="hidden print:flex justify-between items-end mt-24 px-8 pt-12">
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Prepared By</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Authorized Signature</div>
            </div>
        </div>
    )
}
