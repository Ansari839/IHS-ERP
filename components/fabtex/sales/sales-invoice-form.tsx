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
import { Plus, Trash2, Link as LinkIcon, FileText } from 'lucide-react'
import { createSalesInvoice, updateSalesInvoice } from '@/app/actions/fabtex/sales-invoice'

interface InvoiceFormProps {
    salesOrders: any[]
    accounts: any[]
    itemMasters: any[]
    units: any[]
    colors: any[]
    brands: any[]
    itemGrades: any[]
    packingUnits: any[]
    allEligibleDOs?: any[]
    initialData?: any
    invoiceId?: string
    readOnly?: boolean
    segment?: string
}

export function SalesInvoiceForm({
    salesOrders,
    accounts,
    itemMasters,
    units,
    colors,
    brands,
    itemGrades,
    packingUnits,
    allEligibleDOs = [],
    initialData,
    invoiceId,
    readOnly = false,
    segment = 'YARN'
}: InvoiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [invoiceMode, setInvoiceMode] = useState<'SO' | 'DO' | 'DIRECT'>(initialData?.items?.[0]?.deliveryOrderItemId ? 'DO' : (initialData?.salesOrderId ? 'SO' : (initialData?.accountId ? 'DIRECT' : 'SO')))

    // Header States
    const [selectedSO, setSelectedSO] = useState<any>(initialData?.salesOrder || null)
    const [selectedDOId, setSelectedDOId] = useState<string>(initialData?.items?.[0]?.deliveryOrderItemId ? initialData.items[0].deliveryOrderItem?.deliveryOrderId : '')
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialData?.accountId?.toString() || '')
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || `SINV-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [remarks, setRemarks] = useState(initialData?.remarks || '')

    // Items State
    const [items, setItems] = useState<any[]>(initialData?.items?.map((item: any) => ({
        id: item.id,
        salesOrderItemId: item.salesOrderItemId,
        deliveryOrderItemId: item.deliveryOrderItemId,
        itemMasterId: item.itemMasterId || item.salesOrderItem?.itemMasterId,
        itemName: item.itemMaster?.name || item.salesOrderItem?.itemMaster?.name,
        colorId: item.colorId || item.salesOrderItem?.colorId,
        brandId: item.brandId || item.salesOrderItem?.brandId,
        itemGradeId: item.itemGradeId || item.salesOrderItem?.itemGradeId,
        unitId: item.unitId || item.salesOrderItem?.unitId,
        unitSymbol: item.unit?.symbol || item.salesOrderItem?.unit?.symbol,
        packingLabel: item.salesOrderItem?.packingUnit?.symbol || item.salesOrderItem?.packingUnit?.name || item.salesOrderItem?.itemMaster?.packingUnit?.symbol || item.salesOrderItem?.itemMaster?.packingUnit?.name || 'Qty',
        orderedQty: item.salesOrderItem?.quantity || 0,
        alreadyInvoiced: 0,
        remainingQty: item.salesOrderItem?.quantity || 0,
        invoicedQty: item.invoicedQty,
        rate: item.rate,
        amount: item.amount,
        isDoItem: !!item.deliveryOrderItemId
    })) || [])

    // SO Change Handlers
    const onSOChange = (soId: string) => {
        const so = salesOrders.find(p => p.id === soId)
        if (!so) return

        setSelectedSO(so)
        setInvoiceMode('SO')
        setSelectedCustomerId(so.accountId?.toString() || '')
        setSelectedDOId('') // Reset DO selection

        const invoiceItems = so.items.map((item: any) => {
            const alreadyInvoiced = (item.invoiceItems || []).reduce((sum: number, ii: any) => sum + ii.invoicedQty, 0)
            const remaining = (item.quantity || 0) - alreadyInvoiced

            return {
                salesOrderItemId: item.id,
                itemMasterId: item.itemMasterId,
                itemName: item.itemMaster?.name || 'Unknown Item',
                colorId: item.colorId,
                brandId: item.brandId,
                itemGradeId: item.itemGradeId,
                unitId: item.unitId,
                unitSymbol: item.unit?.symbol,
                packingLabel: item.packingUnit?.symbol || item.packingUnit?.name || item.itemMaster?.packingUnit?.symbol || item.itemMaster?.packingUnit?.name || 'Qty',
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

    const onDOChange = (doId: string) => {
        setSelectedDOId(doId)
        if (!selectedSO) return

        if (doId === 'full_so') {
            onSOChange(selectedSO.id)
            return
        }

        const doItem = selectedSO.deliveryOrders.find((g: any) => g.id === doId)
        if (!doItem) return

        // Map DO items back to SO items
        const invoiceItems = doItem.items.map((doItemLine: any) => {
            const soItem = selectedSO.items.find((soi: any) => soi.id === doItemLine.salesOrderItemId)

            return {
                salesOrderItemId: doItemLine.salesOrderItemId,
                deliveryOrderItemId: doItemLine.id,
                itemMasterId: doItemLine.itemMasterId,
                itemName: doItemLine.itemMaster.name,
                colorId: doItemLine.colorId || soItem?.colorId,
                brandId: doItemLine.brandId || soItem?.brandId,
                itemGradeId: doItemLine.itemGradeId || soItem?.itemGradeId,
                unitId: doItemLine.unitId,
                unitSymbol: doItemLine.unit?.symbol,
                packingLabel: doItemLine.packingUnit?.symbol || doItemLine.packingUnit?.name || doItemLine.itemMaster?.packingUnit?.symbol || doItemLine.itemMaster?.packingUnit?.name || soItem?.packingUnit?.symbol || soItem?.packingUnit?.name || soItem?.itemMaster?.packingUnit?.symbol || soItem?.itemMaster?.packingUnit?.name || 'Qty',
                orderedQty: soItem?.quantity || 0,
                alreadyInvoiced: 0,
                remainingQty: doItemLine.deliveredQty,
                invoicedQty: doItemLine.deliveredQty,
                rate: soItem?.rate || 0,
                amount: doItemLine.deliveredQty * (soItem?.rate || 0),
                isDoItem: true
            }
        })
        setItems(invoiceItems)
    }

    const onDirectDOChange = (doId: string) => {
        const doItem = allEligibleDOs.find(g => g.id === doId)
        if (!doItem) return

        const so = salesOrders.find(p => p.id === doItem.salesOrderId)
        if (!so) return

        setSelectedSO(so)
        setInvoiceMode('DO')
        setSelectedDOId(doId)
        setSelectedCustomerId(so.accountId?.toString() || '')

        const invoiceItems = doItem.items.map((doItemLine: any) => {
            const soItem = so.items.find((soi: any) => soi.id === doItemLine.salesOrderItemId)
            return {
                salesOrderItemId: doItemLine.salesOrderItemId,
                deliveryOrderItemId: doItemLine.id,
                itemMasterId: doItemLine.itemMasterId,
                itemName: doItemLine.itemMaster.name,
                colorId: doItemLine.colorId || soItem?.colorId,
                brandId: doItemLine.brandId || soItem?.brandId,
                itemGradeId: doItemLine.itemGradeId || soItem?.itemGradeId,
                unitId: doItemLine.unitId,
                unitSymbol: doItemLine.unit?.symbol,
                packingLabel: doItemLine.packingUnit?.symbol || doItemLine.packingUnit?.name || doItemLine.itemMaster?.packingUnit?.symbol || doItemLine.itemMaster?.packingUnit?.name || soItem?.packingUnit?.symbol || soItem?.packingUnit?.name || soItem?.itemMaster?.packingUnit?.symbol || soItem?.itemMaster?.packingUnit?.name || 'Qty',
                orderedQty: soItem?.quantity || 0,
                alreadyInvoiced: (soItem?.invoiceItems || []).reduce((sum: number, ii: any) => sum + ii.invoicedQty, 0),
                remainingQty: doItemLine.deliveredQty,
                invoicedQty: doItemLine.deliveredQty,
                rate: soItem?.rate || 0,
                amount: doItemLine.deliveredQty * (soItem?.rate || 0),
                isDoItem: true
            }
        })
        setItems(invoiceItems)
    }

    const addDirectItem = () => {
        setItems([...items, {
            salesOrderItemId: null,
            deliveryOrderItemId: null,
            itemMasterId: '',
            itemName: '',
            colorId: '',
            brandId: '',
            itemGradeId: '',
            unitId: '',
            unitSymbol: '',
            packingLabel: 'Qty',
            orderedQty: 0,
            alreadyInvoiced: 0,
            remainingQty: 0,
            invoicedQty: 0,
            rate: 0,
            amount: 0
        }])
    }

    const removeRow = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, updates: any) => {
        setItems(prev => prev.map((it, i) => {
            if (i === index) {
                const newItem = { ...it, ...updates }
                if ('invoicedQty' in updates || 'rate' in updates) {
                    newItem.amount = (newItem.invoicedQty || 0) * (newItem.rate || 0)
                }
                if ('itemMasterId' in updates) {
                    const master = itemMasters.find(m => m.id === updates.itemMasterId)
                    if (master) {
                        newItem.itemName = master.name
                        newItem.unitId = master.baseUnitId
                        newItem.unitSymbol = master.baseUnit?.symbol
                        newItem.packingLabel = master.packingUnit?.symbol || master.packingUnit?.name || 'Qty'
                    }
                }
                return newItem
            }
            return it
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if ((invoiceMode === 'SO' || invoiceMode === 'DO') && !selectedSO) {
            toast.error(`Please select a ${invoiceMode === 'SO' ? 'Sales Order' : 'Delivery Order'}`)
            return
        }

        if (invoiceMode === 'DIRECT' && !selectedCustomerId) {
            toast.error('Please select a Customer')
            return
        }

        const validItems = items.filter(it => it.invoicedQty > 0 || it.itemMasterId)
        if (validItems.length === 0) {
            toast.error('No items to invoice')
            return
        }

        setLoading(true)
        const formData = new FormData()
        if ((invoiceMode === 'SO' || invoiceMode === 'DO') && selectedSO) {
            formData.append('salesOrderId', selectedSO.id)
        }
        if (selectedCustomerId) formData.append('accountId', selectedCustomerId)

        formData.append('invoiceNumber', invoiceNumber)
        formData.append('date', date)
        formData.append('remarks', remarks)
        formData.append('items', JSON.stringify(validItems))
        formData.append('segment', segment)

        let result
        if (invoiceId) {
            result = await updateSalesInvoice(invoiceId, { success: false }, formData)
        } else {
            result = await createSalesInvoice({ success: false }, formData)
        }

        setLoading(true)

        if (result.success) {
            toast.success(result.message)
            router.push('/dashboard/fab-tex/sales/invoice')
        } else {
            setLoading(false)
            toast.error(result.error)
        }
    }

    const totalAmount = items.reduce((sum, it) => sum + (it.amount || 0), 0)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-transparent border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            {invoiceId ? 'Edit Sales Invoice' : 'Generate Sales Invoice'}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={invoiceMode === 'SO' ? 'default' : 'outline'}
                                onClick={() => {
                                    setInvoiceMode('SO')
                                    setItems([])
                                    setSelectedSO(null)
                                }}
                                className="rounded-full"
                                size="sm"
                                disabled={readOnly}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                From SO
                            </Button>
                            <Button
                                type="button"
                                variant={invoiceMode === 'DO' ? 'default' : 'outline'}
                                onClick={() => {
                                    setInvoiceMode('DO')
                                    setItems([])
                                    setSelectedSO(null)
                                    setSelectedDOId('')
                                }}
                                className="rounded-full"
                                size="sm"
                                disabled={readOnly}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                From DO
                            </Button>
                            <Button
                                type="button"
                                variant={invoiceMode === 'DIRECT' ? 'default' : 'outline'}
                                onClick={() => {
                                    setInvoiceMode('DIRECT')
                                    setItems([])
                                    setSelectedSO(null)
                                }}
                                className="rounded-full"
                                size="sm"
                                disabled={readOnly}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Direct Invoice
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    {/* Header Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {invoiceMode === 'SO' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Select Sales Order</Label>
                                <Select
                                    onValueChange={onSOChange}
                                    defaultValue={selectedSO?.id}
                                    disabled={!!invoiceId}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary transition-colors">
                                        <SelectValue placeholder="Search SO..." />
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
                        )}

                        {invoiceMode === 'DO' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Select Delivery Order (DO)</Label>
                                <Select
                                    onValueChange={onDirectDOChange}
                                    defaultValue={selectedDOId}
                                    disabled={!!invoiceId}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary transition-colors">
                                        <SelectValue placeholder="Search DO..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allEligibleDOs.map(doItem => (
                                            <SelectItem key={doItem.id} value={doItem.id}>
                                                {doItem.doNumber} - {doItem.customerName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {invoiceMode === 'DIRECT' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Customer (Account)</Label>
                                <Select
                                    onValueChange={setSelectedCustomerId}
                                    defaultValue={selectedCustomerId}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary transition-colors">
                                        <SelectValue placeholder="Select Customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.filter(a => a.type === 'ASSET' || a.name.toLowerCase().includes('customer')).map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.name} ({acc.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {invoiceMode === 'SO' && selectedSO && (selectedSO.deliveryOrders?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Map from DO (Optional)</Label>
                                <Select
                                    onValueChange={onDOChange}
                                    value={selectedDOId}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20">
                                        <SelectValue placeholder="Select DO..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_so">Full SO Mapping</SelectItem>
                                        {selectedSO.deliveryOrders.map((doItem: any) => (
                                            <SelectItem key={doItem.id} value={doItem.id}>
                                                DO: {doItem.doNumber}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Invoice Number</Label>
                            <Input
                                value={invoiceNumber}
                                onChange={e => setInvoiceNumber(e.target.value)}
                                required
                                className="bg-background/50 border-primary/20"
                                disabled={readOnly}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                                className="bg-background/50 border-primary/20"
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                Invoice Items
                                <Badge variant="secondary" className="rounded-full">{items.length}</Badge>
                            </h3>
                            {invoiceMode === 'DIRECT' && !readOnly && (
                                <Button type="button" onClick={addDirectItem} size="sm" className="rounded-full shadow-lg">
                                    <Plus className="w-4 h-4 mr-2" /> Add Item
                                </Button>
                            )}
                        </div>

                        <div className="rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[300px]">Item Details</TableHead>
                                        <TableHead className="w-[120px]">Billing Qty</TableHead>
                                        <TableHead className="w-[120px]">Rate</TableHead>
                                        <TableHead className="w-[150px]">Amount</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, idx) => (
                                        <TableRow key={idx} className="hover:bg-primary/5 transition-colors group">
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-primary">{item.itemName}</div>
                                                    {item.isDoItem ? (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <div className="text-xs bg-muted px-2 py-1 rounded border border-border/50 flex items-center gap-1">
                                                                <span className="text-muted-foreground font-semibold text-[10px] uppercase">Brand:</span>
                                                                <span className="font-medium text-foreground">{brands.find(b => b.id === item.brandId)?.name || '-'}</span>
                                                            </div>
                                                            <div className="text-xs bg-muted px-2 py-1 rounded border border-border/50 flex items-center gap-1">
                                                                <span className="text-muted-foreground font-semibold text-[10px] uppercase">Color:</span>
                                                                <span className="font-medium text-foreground">{colors.find(c => c.id === item.colorId)?.name || '-'}</span>
                                                            </div>
                                                            <div className="text-xs bg-muted px-2 py-1 rounded border border-border/50 flex items-center gap-1">
                                                                <span className="text-muted-foreground font-semibold text-[10px] uppercase">Grade:</span>
                                                                <span className="font-medium text-foreground">{itemGrades.find(g => g.id === item.itemGradeId)?.name || '-'}</span>
                                                            </div>
                                                        </div>
                                                    ) : invoiceMode === 'SO' ? (
                                                        <div className="flex gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                                            {item.orderedQty > 0 && <span>Ordered: {item.orderedQty}</span>}
                                                            {item.alreadyInvoiced > 0 && <span className="text-blue-500">Billed: {item.alreadyInvoiced}</span>}
                                                            <span>Remain: {item.remainingQty}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <Select
                                                                value={item.itemMasterId}
                                                                onValueChange={(val) => updateItem(idx, { itemMasterId: val })}
                                                            >
                                                                <SelectTrigger className="h-9 truncate">
                                                                    <SelectValue placeholder="Select Product..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {itemMasters.map(m => (
                                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Input
                                                        type="number"
                                                        value={item.invoicedQty || ''}
                                                        placeholder="0.00"
                                                        onChange={e => updateItem(idx, { invoicedQty: parseFloat(e.target.value) || 0 })}
                                                        disabled={readOnly || item.isDoItem}
                                                        className={`h-9 font-medium border-primary/10 ${item.isDoItem ? 'bg-muted opacity-80 cursor-not-allowed' : ''}`}
                                                    />
                                                    <div className="text-[10px] text-center font-semibold text-muted-foreground uppercase">{item.unitSymbol || item.packingLabel || 'Qty'}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Input
                                                        type="number"
                                                        value={item.rate || ''}
                                                        placeholder="0.00"
                                                        onChange={e => updateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
                                                        disabled={readOnly}
                                                        className="h-9 font-medium border-primary/10"
                                                    />
                                                    <div className="text-[10px] text-center text-muted-foreground font-semibold">UNIT PRICE</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-right font-bold text-lg text-primary">
                                                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.amount)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {!readOnly && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRow(idx)}
                                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all rounded-full"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Remarks / Notes</Label>
                        <Textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Additional instructions..."
                            className="bg-background/50 border-primary/20 min-h-[100px] rounded-xl"
                            disabled={readOnly}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center bg-gradient-to-r from-muted/50 to-muted/20 p-6 border-t">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Total Invoice Amount</span>
                        <div className="text-3xl font-black text-primary">
                            PKR {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalAmount)}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="rounded-full px-8 border-primary/20 hover:bg-primary/5"
                        >
                            Cancel
                        </Button>
                        {!readOnly && (
                            <Button
                                type="submit"
                                disabled={loading || (invoiceMode === 'SO' && !selectedSO) || (invoiceMode === 'DIRECT' && !selectedCustomerId)}
                                className="rounded-full px-10 shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    <span>{invoiceId ? 'Update Invoice' : 'Post Invoice'}</span>
                                )}
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </form>
    )
}
