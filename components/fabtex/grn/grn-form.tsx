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
}

export function GRNForm({ purchaseOrders, initialData, grnId }: GRNFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedPO, setSelectedPO] = useState<any>(initialData?.purchaseOrder || null)
    const [grnNumber, setGrnNumber] = useState(initialData?.grnNumber || `GRN-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
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
                    unitId: poItem.unitId
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
                unitId: item.unitId
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
        formData.append('remarks', remarks)
        formData.append('items', JSON.stringify(validItems))

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
                    </div>

                    {selectedPO && (
                        <div className="rounded-md border mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Ordered</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead className="w-[150px]">Receiving Qty</TableHead>
                                        <TableHead className="w-[100px]">Pcs</TableHead>
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
                                            <TableCell>{item.orderedQty} {item.unitSymbol}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.remainingQty > 0 ? 'outline' : 'secondary'}>
                                                    {item.remainingQty} {item.unitSymbol}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.receivedQty}
                                                    step="0.01"
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) =>
                                                            i === idx ? { ...it, receivedQty: val } : it
                                                        ))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.pcs}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) =>
                                                            i === idx ? { ...it, pcs: val } : it
                                                        ))
                                                    }}
                                                />
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
