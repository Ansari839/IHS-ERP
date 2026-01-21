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
import { createPurchaseInvoice, updatePurchaseInvoice } from '@/app/actions/fabtex/purchase-invoice'

interface InvoiceFormProps {
    purchaseOrders: any[]
    initialData?: any
    invoiceId?: string
}

export function InvoiceForm({ purchaseOrders, initialData, invoiceId }: InvoiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedPO, setSelectedPO] = useState<any>(initialData?.purchaseOrder || null)
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [items, setItems] = useState<any[]>(initialData?.items?.map((item: any) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        itemMasterId: item.purchaseOrderItem?.itemMasterId,
        itemName: item.purchaseOrderItem?.itemMaster?.name,
        unitSymbol: item.purchaseOrderItem?.unit?.symbol,
        orderedQty: item.purchaseOrderItem?.quantity || 0,
        alreadyInvoiced: 0, // This is tricky in edit mode, but for display it's fine
        remainingQty: item.purchaseOrderItem?.quantity || 0,
        invoicedQty: item.invoicedQty,
        rate: item.rate,
        amount: item.amount,
        grnItemId: item.grnItemId
    })) || [])

    const onPOChange = (poId: string) => {
        const po = purchaseOrders.find(p => p.id === poId)
        if (!po) return
        setSelectedPO(po)

        const invoiceItems = po.items.map((item: any) => {
            const alreadyInvoiced = (item.invoiceItems || []).reduce((sum: number, ii: any) => sum + ii.invoicedQty, 0)
            const remaining = (item.quantity || 0) - alreadyInvoiced

            return {
                purchaseOrderItemId: item.id,
                itemMasterId: item.itemMasterId,
                itemName: item.itemMaster.name,
                unitSymbol: item.unit?.symbol,
                orderedQty: item.quantity || 0,
                alreadyInvoiced,
                remainingQty: remaining > 0 ? remaining : 0,
                invoicedQty: remaining > 0 ? remaining : 0,
                rate: item.rate,
                amount: (remaining > 0 ? remaining : 0) * item.rate
            }
        })
        setItems(invoiceItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPO) {
            toast.error('Please select a Purchase Order')
            return
        }

        const validItems = items.filter(it => it.invoicedQty > 0)
        if (validItems.length === 0) {
            toast.error('No items to invoice')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('purchaseOrderId', selectedPO.id)
        formData.append('invoiceNumber', invoiceNumber)
        formData.append('date', date)
        formData.append('items', JSON.stringify(validItems))

        let result
        if (invoiceId) {
            result = await updatePurchaseInvoice(invoiceId, { success: false }, formData)
        } else {
            result = await createPurchaseInvoice({ success: false }, formData)
        }

        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            router.push('/dashboard/fab-tex/purchase/invoice')
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{invoiceId ? 'Edit Purchase Invoice' : 'Generate Purchase Invoice'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Select Purchase Order</Label>
                            <Select
                                onValueChange={onPOChange}
                                defaultValue={selectedPO?.id}
                                disabled={!!invoiceId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PO" />
                                </SelectTrigger>
                                <SelectContent>
                                    {purchaseOrders.map(po => (
                                        <SelectItem key={po.id} value={po.id}>
                                            {po.poNumber} - {po.account?.name || po.partyName}
                                        </SelectItem>
                                    ))}
                                    {invoiceId && selectedPO && (
                                        <SelectItem key={selectedPO.id} value={selectedPO.id}>
                                            {selectedPO.poNumber} - {selectedPO.account?.name || selectedPO.partyName}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                    </div>

                    {selectedPO && (
                        <div className="rounded-md border mt-4 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead className="w-[120px]">Billing Qty</TableHead>
                                        <TableHead className="w-[120px]">Rate</TableHead>
                                        <TableHead className="w-[150px]">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <div className="font-medium">{item.itemName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Ordered: {item.orderedQty} | Invoiced: {item.alreadyInvoiced}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.remainingQty} {item.unitSymbol}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.invoicedQty}
                                                    max={item.remainingQty}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) => {
                                                            if (i === idx) {
                                                                return { ...it, invoicedQty: val, amount: val * it.rate }
                                                            }
                                                            return it
                                                        }))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0
                                                        setItems(prev => prev.map((it, i) => {
                                                            if (i === idx) {
                                                                return { ...it, rate: val, amount: it.invoicedQty * val }
                                                            }
                                                            return it
                                                        }))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-muted/50 p-6">
                    <div className="text-lg font-bold">
                        Total Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(
                            items.reduce((sum, it) => sum + (it.amount || 0), 0)
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading || !selectedPO}>
                            {loading ? 'Processing...' : (invoiceId ? 'Update Invoice' : 'Post Invoice')}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    )
}
