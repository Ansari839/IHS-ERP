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
import { Trash2, Package, Plus, Search, Undo2, Save, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { createDeliveryOrder, updateDeliveryOrder } from '@/app/actions/fabtex/delivery-order'

interface DOFormProps {
    salesOrders: any[]
    initialData?: any
    doId?: string
    segment?: string
}

export function DeliveryOrderForm({ salesOrders, initialData, doId, segment = 'YARN' }: DOFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedSO, setSelectedSO] = useState<any>(initialData?.salesOrder || null)
    const [doNumber, setDoNumber] = useState(initialData?.doNumber || `DO-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [gatePassNo, setGatePassNo] = useState(initialData?.gatePassNo || '')
    const [vehicleNo, setVehicleNo] = useState(initialData?.vehicleNo || '')
    const [remarks, setRemarks] = useState(initialData?.remarks || '')
    const [items, setItems] = useState<any[]>(initialData?.items?.map((it: any) => ({
        salesOrderItemId: it.salesOrderItemId,
        itemMasterId: it.itemMasterId,
        itemName: it.itemMaster.name,
        colorName: it.color?.name,
        brandName: it.brand?.name,
        gradeName: it.itemGrade?.name,
        unitSymbol: it.unit?.symbol,
        // For calculated fields, we need to handle their state carefully during edit
        deliveredQty: it.deliveredQty,
        pcs: it.pcs || 0,
        unitId: it.unitId,
        packingUnitId: it.packingUnitId,
        packingUnitSymbol: it.packingUnit?.symbol || it.packingUnit?.name || it.itemMaster?.packingUnit?.symbol || it.itemMaster?.packingUnit?.name,
        packingType: it.packingType || 'EVEN',
        unitSize: it.unitSize || 0,
        // These are needed for validation/UI even in edit
        remainingQty: 999999, // placeholder, will refine if needed
        orderedQty: 999999
    })) || [])

    // If editing, we need to calculate remaining qty including this DO's current contribution
    useEffect(() => {
        if (initialData && selectedSO) {
            const mappedItems = selectedSO.items.map((soItem: any) => {
                const currentDoItem = initialData.items.find((di: any) => di.salesOrderItemId === soItem.id)
                const alreadyDeliveredByOthers = soItem.deliveryOrderItems
                    .filter((di: any) => di.deliveryOrderId !== doId)
                    .reduce((sum: number, di: any) => sum + di.deliveredQty, 0)

                const remaining = soItem.quantity - alreadyDeliveredByOthers

                return {
                    salesOrderItemId: soItem.id,
                    itemMasterId: soItem.itemMasterId,
                    itemName: soItem.itemMaster.name,
                    colorName: soItem.color?.name,
                    brandName: soItem.brand?.name,
                    gradeName: soItem.itemGrade?.name,
                    unitSymbol: soItem.unit?.symbol,
                    orderedQty: soItem.quantity,
                    alreadyDelivered: alreadyDeliveredByOthers,
                    remainingQty: remaining > 0 ? remaining : 0,
                    deliveredQty: currentDoItem?.deliveredQty || 0,
                    pcs: currentDoItem?.pcs || 0,
                    unitSize: currentDoItem?.unitSize || soItem.unitSize || 0,
                    packingType: currentDoItem?.packingType || soItem.packingType || 'EVEN',
                    unitId: soItem.unitId,
                    packingUnitId: soItem.packingUnitId,
                    packingUnitSymbol: soItem.packingUnit?.symbol || soItem.packingUnit?.name || soItem.itemMaster?.packingUnit?.symbol || soItem.itemMaster?.packingUnit?.name
                }
            })
            setItems(mappedItems)
        }
    }, [initialData, selectedSO, doId])

    const onSOChange = (soId: string) => {
        const so = salesOrders.find(p => p.id === soId)
        if (!so) return
        setSelectedSO(so)

        const doItems = so.items.map((item: any) => {
            const alreadyDelivered = item.deliveryOrderItems.reduce((sum: number, di: any) => sum + di.deliveredQty, 0)
            const remaining = item.quantity - alreadyDelivered

            return {
                salesOrderItemId: item.id,
                itemMasterId: item.itemMasterId,
                itemName: item.itemMaster.name,
                colorName: item.color?.name,
                brandName: item.brand?.name,
                gradeName: item.itemGrade?.name,
                unitSymbol: item.unit?.symbol,
                orderedQty: item.quantity,
                alreadyDelivered,
                remainingQty: remaining > 0 ? remaining : 0,
                deliveredQty: remaining > 0 ? remaining : 0,
                pcs: item.pcs || 0,
                unitSize: item.unitSize || 0,
                packingType: item.packingType || 'EVEN',
                unitId: item.unitId,
                packingUnitId: item.packingUnitId,
                packingUnitSymbol: item.packingUnit?.symbol || item.packingUnit?.name || item.itemMaster?.packingUnit?.symbol || item.itemMaster?.packingUnit?.name
            }
        })
        setItems(doItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSO) {
            toast.error('Please select a Sales Order')
            return
        }

        const validItems = items.filter(it => it.deliveredQty > 0)
        if (validItems.length === 0) {
            toast.error('No items to deliver')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('salesOrderId', selectedSO.id)
        formData.append('doNumber', doNumber)
        formData.append('date', date)
        formData.append('gatePassNo', gatePassNo)
        formData.append('vehicleNo', vehicleNo)
        formData.append('remarks', remarks)
        formData.append('items', JSON.stringify(validItems))
        formData.append('segment', segment)

        let result;
        if (doId) {
            result = await updateDeliveryOrder(doId, { success: false }, formData)
        } else {
            result = await createDeliveryOrder({ success: false }, formData)
        }

        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            router.push('/dashboard/fab-tex/sales/delivery-order')
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{doId ? 'Edit Delivery Order' : 'Dispatch Goods (DO)'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Select Sales Order</Label>
                            <Select onValueChange={onSOChange} value={selectedSO?.id} disabled={!!doId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select SO" />
                                </SelectTrigger>
                                <SelectContent>
                                    {salesOrders.map(so => (
                                        <SelectItem key={so.id} value={so.id}>
                                            {so.soNumber} - {so.account?.name || so.partyName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>DO Number</Label>
                            <Input value={doNumber} onChange={e => setDoNumber(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        {selectedSO?.fileNo && (
                            <div className="space-y-2">
                                <Label>SO File No</Label>
                                <div className="p-2 border rounded-md bg-muted/30 font-medium">
                                    {selectedSO.fileNo}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Gate Pass No</Label>
                            <Input value={gatePassNo} onChange={e => setGatePassNo(e.target.value)} placeholder="GP-XXXX" />
                        </div>
                        <div className="space-y-2">
                            <Label>Vehicle No</Label>
                            <Input value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="Vehicle Reg No" />
                        </div>
                    </div>

                    {selectedSO && (
                        <div className="rounded-md border mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>P. Unit</TableHead>
                                        <TableHead>P. Type</TableHead>
                                        <TableHead>Ordered</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead className="w-[100px]">{items.find(i => i.packingUnitSymbol)?.packingUnitSymbol || 'Pkgs'} Count</TableHead>
                                        <TableHead className="w-[100px]">{items.find(i => i.packingUnitSymbol)?.packingUnitSymbol || 'Pkg'} Size</TableHead>
                                        <TableHead className="w-[150px]">Delivered Qty</TableHead>
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
                                                    type="number"
                                                    value={item.pcs}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) => {
                                                            if (i === idx) {
                                                                const newRaw = { ...it, pcs: val }
                                                                if (it.packingType === 'EVEN') {
                                                                    newRaw.deliveredQty = val * (it.unitSize || 0)
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
                                                                    newRaw.deliveredQty = (it.pcs || 0) * val
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
                                                    value={item.deliveredQty}
                                                    step="0.01"
                                                    disabled={item.packingType === 'EVEN'}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) =>
                                                            i === idx ? { ...it, deliveredQty: val } : it
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
                                                    <Trash2 className="h-4 w-4" />
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
                    <Button type="submit" disabled={loading || !selectedSO}>
                        {loading ? 'Processing...' : (doId ? 'Update DO' : 'Post DO')}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
