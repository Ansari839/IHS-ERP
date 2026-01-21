import { getGRNById } from '@/app/actions/fabtex/grn'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PrintButton } from '@/components/ui/print-button'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

export default async function GRNDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const grn = await getGRNById(id)

    if (!grn) notFound()

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">GRN Preview (Goods Receipt Note)</h2>
                <PrintButton />
            </div>

            <Card className="print:border-none print:shadow-none">
                <CardHeader className="border-b mb-6 print:pb-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            {grn.company?.logoUrl && (
                                <img src={grn.company.logoUrl} alt="Logo" className="h-12 mb-4 object-contain" />
                            )}
                            <h3 className="text-2xl font-bold">{grn.company?.legalName || 'Company Name'}</h3>
                            <p className="text-sm text-muted-foreground">{grn.company?.address}</p>
                            <p className="text-sm text-muted-foreground">{grn.company?.email} | {grn.company?.phone}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <h2 className="text-xl font-bold text-primary">GOOD RECEIPT NOTE</h2>
                            <div className="text-sm">
                                <span className="text-muted-foreground">GRN Code:</span>
                                <span className="font-bold ml-2">{grn.grnNumber}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium ml-2">{format(new Date(grn.date), 'dd MMMM yyyy')}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">PO Ref:</span>
                                <span className="font-medium ml-2">{grn.purchaseOrder.poNumber}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Supplier</h4>
                            <div className="space-y-1">
                                <p className="font-bold">{grn.purchaseOrder.account?.name || grn.purchaseOrder.partyName}</p>
                                <p className="text-sm">{grn.purchaseOrder.account?.description || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase text-primary mb-2 border-b">Received At</h4>
                            <div className="space-y-1">
                                <p className="font-bold">{grn.purchaseOrder.warehouse?.name || 'Central Warehouse'}</p>
                                <p className="text-sm">{grn.purchaseOrder.warehouse?.location || grn.company?.address}</p>
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
                                    <TableHead className="text-right">Received Qty</TableHead>
                                    <TableHead className="text-right">Pcs/Packages</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grn.items.map((item: any, idx: number) => (
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
                                            {item.receivedQty} {item.unit?.symbol || 'kg'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.pcs || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {grn.remarks && (
                        <div className="pt-8">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Remarks</h4>
                            <p className="text-sm italic">{grn.remarks}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="hidden print:flex justify-between items-end mt-24 px-8 pt-12">
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Received By</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">Store Keeper</div>
                <div className="text-center w-48 border-t border-black pt-2 text-sm font-medium">QA/QC Signature</div>
            </div>
        </div>
    )
}
