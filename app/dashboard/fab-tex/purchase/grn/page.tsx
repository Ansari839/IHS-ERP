import { getGRNs } from '@/app/actions/fabtex/grn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { GRNActions } from '@/components/fabtex/grn/grn-actions'

export default async function GRNListPage() {
    const grns = await getGRNs()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Goods Receipt Notes (GRN)</h2>
                <Button asChild>
                    <Link href="/dashboard/fab-tex/purchase/grn/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create GRN
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent GRNs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>GRN Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Lot No</TableHead>
                                <TableHead>WH Ref No</TableHead>
                                <TableHead>Purchase Order</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        No GRNs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                grns.map((grn) => (
                                    <TableRow key={grn.id}>
                                        <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                                        <TableCell>{format(new Date(grn.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{grn.lotNo || '-'}</TableCell>
                                        <TableCell>{grn.warehouseRefNo || '-'}</TableCell>
                                        <TableCell>{grn.purchaseOrder.poNumber}</TableCell>
                                        <TableCell>{grn.purchaseOrder.account?.name || grn.purchaseOrder.partyName || '-'}</TableCell>
                                        <TableCell>{grn.items.length} Items</TableCell>
                                        <TableCell className="text-right">
                                            <GRNActions grnId={grn.id} />
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
