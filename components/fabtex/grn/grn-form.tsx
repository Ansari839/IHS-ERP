'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createGRN, updateGRN } from '@/app/actions/fabtex/grn'

interface GRNFormProps {
    purchaseOrders: any[]
    initialData?: any
    grnId?: string
    segment?: string
}

export function GRNForm({ purchaseOrders, initialData, grnId, segment = 'YARN' }: GRNFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedPO, setSelectedPO] = useState<any>(initialData?.purchaseOrder || null)
    const [grnNumber, setGrnNumber] = useState(initialData?.grnNumber || `GRN-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [lotNo, setLotNo] = useState(initialData?.lotNo || '')
    const [warehouseRefNo, setWarehouseRefNo] = useState(initialData?.warehouseRefNo || '')
    const [remarks, setRemarks] = useState(initialData?.remarks || '')
    const [items, setItems] = useState<any[]>(initialData?.items?.map((it: any) => ({
        purchaseOrderItemId: it.purchaseOrderItemId,
        itemMasterId: it.itemMasterId,
        itemName: it.itemMaster.name,
        colorName: it.color?.name,
        brandName: it.brand?.name,
        gradeName: it.itemGrade?.name,
        unitSymbol: it.unit?.symbol,
        // For calculated fields, we need to handle their state carefully during edit
        receivedQty: it.receivedQty,
        pcs: it.pcs || 0,
        unitId: it.unitId,
        packingUnitId: it.packingUnitId,
        packingUnitSymbol: it.packingUnit?.symbol || it.packingUnit?.name || it.itemMaster?.packingUnit?.symbol || it.itemMaster?.packingUnit?.name,
        packingType: it.packingType || 'EVEN',
        unitSize: it.unitSize || 0,
        lotNo: it.lotNo || '',
        warehouseRefNo: it.warehouseRefNo || '',
        // These are needed for validation/UI even in edit
        remainingQty: 999999, // placeholder, will refine if needed
        orderedQty: 999999
    })) || [])

    // If editing, we need to calculate remaining qty including this GRN's current contribution
    useEffect(() => {
        if (initialData && selectedPO) {
            const mappedItems = selectedPO.items.map((poItem: any) => {
                const currentGrnItem = initialData.items.find((gi: any) => gi.purchaseOrderItemId === poItem.id)
                const alreadyReceivedByOthers = poItem.grnItems
                    .filter((gi: any) => gi.grnId !== grnId)
                    .reduce((sum: number, gi: any) => sum + gi.receivedQty, 0)

                const remaining = poItem.quantity - alreadyReceivedByOthers

                return {
                    purchaseOrderItemId: poItem.id,
                    itemMasterId: poItem.itemMasterId,
                    itemName: poItem.itemMaster.name,
                    colorName: poItem.color?.name,
                    brandName: poItem.brand?.name,
                    gradeName: poItem.itemGrade?.name,
                    unitSymbol: poItem.unit?.symbol,
                    orderedQty: poItem.quantity,
                    alreadyReceived: alreadyReceivedByOthers,
                    remainingQty: remaining > 0 ? remaining : 0,
                    receivedQty: currentGrnItem?.receivedQty || 0,
                    pcs: currentGrnItem?.pcs || 0,
                    unitSize: currentGrnItem?.unitSize || poItem.unitSize || 0,
                    packingType: currentGrnItem?.packingType || poItem.packingType || 'EVEN',
                    unitId: poItem.unitId,
                    packingUnitId: poItem.packingUnitId,
                    packingUnitSymbol: poItem.packingUnit?.symbol || poItem.packingUnit?.name || poItem.itemMaster?.packingUnit?.symbol || poItem.itemMaster?.packingUnit?.name,
                    lotNo: currentGrnItem?.lotNo || '',
                    warehouseRefNo: currentGrnItem?.warehouseRefNo || '',
                }
            })
            setItems(mappedItems)
        }
    }, [initialData, selectedPO, grnId])

    const onPOChange = (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId)
        if (!po) return
        setSelectedPO(po)

        const grnItems = po.items.map((item: any) => {
            const alreadyReceived = item.grnItems.reduce((sum: number, gi: any) => sum + gi.receivedQty, 0)
            const remaining = item.quantity - alreadyReceived

            return {
                purchaseOrderItemId: item.id,
                itemMasterId: item.itemMasterId,
                itemName: item.itemMaster.name,
                colorName: item.color?.name,
                brandName: item.brand?.name,
                gradeName: item.itemGrade?.name,
                unitSymbol: item.unit?.symbol,
                orderedQty: item.quantity,
                alreadyReceived,
                remainingQty: remaining > 0 ? remaining : 0,
                receivedQty: remaining > 0 ? remaining : 0,
                pcs: item.pcs || 0,
                unitSize: item.unitSize || 0,
                packingType: item.packingType || 'EVEN',
                unitId: item.unitId,
                packingUnitId: item.packingUnitId,
                packingUnitSymbol: item.packingUnit?.symbol || item.packingUnit?.name || item.itemMaster?.packingUnit?.symbol || item.itemMaster?.packingUnit?.name,
                lotNo: '',
                warehouseRefNo: ''
            }
        })
        setItems(grnItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPO) {
            toast.error('Please select a Purchase Order')
            return
        }

        const validItems = items.filter(it => it.receivedQty > 0)
        if (validItems.length === 0) {
            toast.error('No items to receive')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('purchaseOrderId', selectedPO.id)
        formData.append('grnNumber', grnNumber)
        formData.append('date', date)
        formData.append('lotNo', lotNo)
        formData.append('warehouseRefNo', warehouseRefNo)
        formData.append('remarks', remarks)
        formData.append('items', JSON.stringify(validItems))
        formData.append('segment', segment)

        let result;
        if (grnId) {
            result = await updateGRN(grnId, { success: false }, formData)
        } else {
            result = await createGRN({ success: false }, formData)
        }

        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            router.push('/dashboard/fab-tex/purchase/grn')
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{grnId ? 'Edit GRN' : 'Receive Goods (GRN)'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Select Purchase Order</Label>
                            <Select onValueChange={onPOChange} value={selectedPO?.id} disabled={!!grnId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PO" />
                                </SelectTrigger>
                                <SelectContent>
                                    {purchaseOrders.map(po => (
                                        <SelectItem key={po.id} value={po.id}>
                                            {po.poNumber} - {po.account?.name || po.partyName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>GRN Number</Label>
                            <Input value={grnNumber} onChange={e => setGrnNumber(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        {selectedPO?.fileNo && (
                            <div className="space-y-2">
                                <Label>PO File No</Label>
                                <div className="p-2 border rounded-md bg-muted/30 font-medium">
                                    {selectedPO.fileNo}
                                </div>
                            </div>
                        )}
                    </div>


                    {selectedPO && (
                        <div className="rounded-md border mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>P. Unit</TableHead>
                                        <TableHead>P. Type</TableHead>
                                        <TableHead>Ordered</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead className="w-[120px]">Lot No</TableHead>
                                        <TableHead className="w-[120px]">WH Ref</TableHead>
                                        <TableHead className="w-[100px]">{items.find(i => i.packingUnitSymbol)?.packingUnitSymbol || 'Pkgs'} Count</TableHead>
                                        <TableHead className="w-[100px]">{items.find(i => i.packingUnitSymbol)?.packingUnitSymbol || 'Pkg'} Size</TableHead>
                                        <TableHead className="w-[100px]">Qty</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <div className="font-medium">{item.itemName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.colorName} / {item.gradeName} / {item.brandName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-medium">{item.packingUnitSymbol || '-'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {item.packingType?.toLowerCase() || 'even'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.orderedQty} {item.unitSymbol}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.remainingQty > 0 ? 'outline' : 'secondary'}>
                                                    {item.remainingQty} {item.unitSymbol}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={item.lotNo}
                                                    onChange={e => {
                                                        const val = e.target.value
                                                        setItems(prev => prev.map((it, i) => i === idx ? { ...it, lotNo: val } : it))
                                                    }}
                                                    placeholder="Lot No"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={item.warehouseRefNo}
                                                    onChange={e => {
                                                        const val = e.target.value
                                                        setItems(prev => prev.map((it, i) => i === idx ? { ...it, warehouseRefNo: val } : it))
                                                    }}
                                                    placeholder="WH Ref"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.pcs}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) => {
                                                            if (i === idx) {
                                                                const newRaw = { ...it, pcs: val }
                                                                if (it.packingType === 'EVEN') {
                                                                    newRaw.receivedQty = val * (it.unitSize || 0)
                                                                }
                                                                return newRaw
                                                            }
                                                            return it
                                                        }))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.unitSize}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) => {
                                                            if (i === idx) {
                                                                const newRaw = { ...it, unitSize: val }
                                                                if (it.packingType === 'EVEN') {
                                                                    newRaw.receivedQty = (it.pcs || 0) * val
                                                                }
                                                                return newRaw
                                                            }
                                                            return it
                                                        }))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.receivedQty}
                                                    step="0.01"
                                                    disabled={item.packingType === 'EVEN'}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) =>
                                                            i === idx ? { ...it, receivedQty: val } : it
                                                        ))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => {
                                                        setItems(prev => prev.filter((_, i) => i !== idx))
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Remarks</Label>
                        <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any notes here..." />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading || !selectedPO}>
                        {loading ? 'Processing...' : (grnId ? 'Update GRN' : 'Post GRN')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
