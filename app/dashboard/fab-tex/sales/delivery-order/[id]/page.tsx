
import { getDeliveryOrderById } from '@/app/actions/fabtex/delivery-order'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PrintButton } from '@/components/ui/print-button'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export default async function DODetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const doItem = await getDeliveryOrderById(id)

    if (!doItem) notFound()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">Delivery Order Preview</h2>
                <PrintButton />
            </div>

            <Card className="print:border-none print:shadow-none">
                <CardHeader className="border-b mb-6 print:pb-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            {doItem.company?.logoUrl && (
                                <img src={doItem.company.logoUrl} alt="Logo" className="h-12 mb-4 object-contain" />
                            )}
                            <h3 className="text-2xl font-bold">{doItem.company?.legalName || 'Company Name'}</h3>
                            <p className="text-sm text-muted-foreground">{doItem.company?.address}</p>
                            <p className="text-sm text-muted-foreground">{doItem.company?.email} | {doItem.company?.phone}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <h2 className="text-xl font-bold text-primary">DELIVERY ORDER (GATE PASS)</h2>
                            <div className="text-sm">
                                <span className="text-muted-foreground">DO Code:</span>
                                <span className="font-bold ml-2">{doItem.doNumber}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium ml-2">{format(new Date(doItem.date), 'dd MMMM yyyy')}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">SO Ref:</span>
                                <span className="font-medium ml-2">{doItem.salesOrder?.soNumber || 'DIRECT'}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Gate Pass:</span>
                                <span className="font-medium ml-2">{doItem.gatePassNo || '-'}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Vehicle:</span>
                                <span className="font-medium ml-2">{doItem.vehicleNo || '-'}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Customer (Bill To)</h4>
                            <div className="space-y-1">
                                <p className="font-bold">{doItem.account?.name || doItem.salesOrder?.account?.name || doItem.salesOrder?.partyName || 'Unknown Customer'}</p>
                                <p className="text-sm">{doItem.account?.description || doItem.salesOrder?.account?.description || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Dispatched From</h4>
                            <div className="space-y-1">
                                <p className="font-bold">{doItem.salesOrder?.warehouse?.name || 'Central Warehouse'}</p>
                                <p className="text-sm">{doItem.salesOrder?.warehouse?.location || doItem.company?.address || 'Company Location'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Specification (Color/Brand/Grade)</TableHead>
                                    <TableHead className="text-right">Delivered Qty</TableHead>
                                    <TableHead className="text-right">{doItem.items[0]?.packingUnit?.symbol || doItem.items[0]?.packingUnit?.name || doItem.items[0]?.itemMaster?.packingUnit?.symbol || doItem.items[0]?.itemMaster?.packingUnit?.name || 'Pkgs'} Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {doItem.items.map((item: any, idx: number) => (
                                    <TableRow key={item.id} className="print:break-inside-avoid">
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>
                                            <div className="font-bold">{item.itemMaster.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs space-y-0.5">
                                                {item.color && <span>Color: {item.color.name}</span>}
                                                {item.brand && <span> | Brand: {item.brand.name}</span>}
                                                {item.itemGrade && <span> | Grade: {item.itemGrade.name}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {item.deliveredQty} {item.unit?.symbol || 'kg'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.pcs ? `${item.pcs} ${item.packingUnit?.symbol || item.packingUnit?.name || item.itemMaster?.packingUnit?.symbol || item.itemMaster?.packingUnit?.name || 'Pkgs'}` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {doItem.remarks && (
                        <div className="pt-8">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Remarks</h4>
                            <p className="text-sm italic">{doItem.remarks}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="hidden print:flex justify-between items-end mt-24 px-8 pt-12">
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Prepared By</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Store Incharge</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Receiver's Signature</div>
            </div>
        </div>
    )
}
