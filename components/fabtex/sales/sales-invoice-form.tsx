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
    warehouses: any[]
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
    warehouses = [],
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
    const [warehouseId, setWarehouseId] = useState<string>(initialData?.warehouseId?.toString() || '')
    const [warehouseRefNo, setWarehouseRefNo] = useState(initialData?.warehouseRefNo || '')

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
        pcs: item.pcs || 0,
        unitSize: item.unitSize || 0,
        packingType: item.packingType || 'EVEN',
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
                amount: (remaining > 0 ? remaining : 0) * item.rate,
                pcs: item.pcs || 0,
                unitSize: item.unitSize || 0,
                packingType: item.packingType || 'EVEN'
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
                pcs: doItemLine.pcs || 0,
                unitSize: doItemLine.unitSize || 0,
                packingType: doItemLine.packingType || 'EVEN',
                isDoItem: true
            }
        })
        setItems(invoiceItems)
    }

    const onDirectDOChange = (doId: string) => {
        const doItem = allEligibleDOs.find(g => g.id === doId)
        if (!doItem) return

        const so = doItem.salesOrderId ? salesOrders.find(p => p.id === doItem.salesOrderId) : null

        setSelectedSO(so)
        setInvoiceMode('DO')
        setSelectedDOId(doId)
        setSelectedCustomerId(doItem.accountId?.toString() || so?.accountId?.toString() || '')

        const invoiceItems = doItem.items.map((doItemLine: any) => {
            const soItem = so ? so.items.find((soi: any) => soi.id === doItemLine.salesOrderItemId) : null
            return {
                salesOrderItemId: doItemLine.salesOrderItemId ? doItemLine.salesOrderItemId : null,
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
                alreadyInvoiced: soItem ? (soItem.invoiceItems || []).reduce((sum: number, ii: any) => sum + ii.invoicedQty, 0) : 0,
                remainingQty: doItemLine.deliveredQty,
                invoicedQty: doItemLine.deliveredQty,
                rate: soItem?.rate || 0,
                amount: doItemLine.deliveredQty * (soItem?.rate || 0),
                pcs: doItemLine.pcs || 0,
                unitSize: doItemLine.unitSize || 0,
                packingType: doItemLine.packingType || 'EVEN',
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
            invoicedQty: 0,
            rate: 0,
            amount: 0,
            pcs: 0,
            unitSize: 0,
            packingType: 'EVEN'
        }])
    }

    const removeRow = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, updates: any) => {
        setItems(prev => prev.map((it, i) => {
            if (i === index) {
                const newItem = { ...it, ...updates }

                // Packing Logic consistency with Delivery Order
                if ('packingType' in updates || 'pcs' in updates || 'unitSize' in updates) {
                    if (newItem.packingType === 'EVEN') {
                        newItem.invoicedQty = (newItem.pcs || 0) * (newItem.unitSize || 0)
                    }
                }

                if ('invoicedQty' in updates || 'rate' in updates || 'packingType' in updates || 'pcs' in updates || 'unitSize' in updates) {
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
        formData.append('warehouseId', warehouseId)
        formData.append('warehouseRefNo', warehouseRefNo)
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {invoiceMode === 'SO' && (
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-semibold text-blue-600">Select Sales Order</Label>
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
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-semibold text-blue-600">Select Delivery Order (DO)</Label>
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
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-semibold text-blue-600">Customer (Account)</Label>
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

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Invoice Number</Label>
                            <Input
                                value={invoiceNumber}
                                onChange={e => setInvoiceNumber(e.target.value)}
                                className="bg-background/50 font-mono"
                                readOnly={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="bg-background/50"
                                readOnly={readOnly}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-emerald-600">Warehouse / Godown</Label>
                            <Select value={warehouseId} onValueChange={setWarehouseId} disabled={readOnly}>
                                <SelectTrigger className="bg-background/50 border-emerald-200">
                                    <SelectValue placeholder="Select Godown" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(w => (
                                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-emerald-600">Godown Ref</Label>
                            <Input
                                value={warehouseRefNo}
                                onChange={e => setWarehouseRefNo(e.target.value)}
                                placeholder="Ref/Challan No"
                                className="bg-background/50 border-emerald-200"
                                readOnly={readOnly}
                            />
                        </div>

                        {invoiceMode === 'SO' && selectedSO && (selectedSO.deliveryOrders?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-orange-600">Map from DO (Optional)</Label>
                                <Select
                                    onValueChange={onDOChange}
                                    value={selectedDOId}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="bg-background/50 border-orange-200">
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
                                <TableHeader className="bg-muted/50 text-[10px] uppercase">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Item Details</TableHead>
                                        <TableHead className="w-[90px]">P. Type</TableHead>
                                        <TableHead className="w-[70px]">Pkgs</TableHead>
                                        <TableHead className="w-[70px]">Size</TableHead>
                                        <TableHead className="w-[110px]">Billing Qty</TableHead>
                                        <TableHead className="w-[100px]">Rate</TableHead>
                                        <TableHead className="w-[120px]">Amount</TableHead>
                                        {!readOnly && <TableHead className="w-[50px]"></TableHead>}
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
                                                            <div className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border/50">
                                                                <span className="text-muted-foreground mr-1">BRAND:</span>
                                                                {brands.find(b => b.id === item.brandId)?.name || '-'}
                                                            </div>
                                                            <div className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border/50">
                                                                <span className="text-muted-foreground mr-1">COLOR:</span>
                                                                {colors.find(c => c.id === item.colorId)?.name || '-'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <Select
                                                                value={item.itemMasterId}
                                                                onValueChange={(val) => updateItem(idx, { itemMasterId: val })}
                                                            >
                                                                <SelectTrigger className="h-8 text-[11px] truncate">
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
                                                <Select
                                                    value={item.packingType || 'EVEN'}
                                                    onValueChange={val => updateItem(idx, { packingType: val })}
                                                    disabled={readOnly}
                                                >
                                                    <SelectTrigger className="h-8 text-[10px] capitalize">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EVEN">Even</SelectItem>
                                                        <SelectItem value="UNEVEN">Uneven</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.pcs || ''}
                                                    step="0.01"
                                                    className="h-8 text-xs text-center font-bold"
                                                    onChange={e => updateItem(idx, { pcs: parseFloat(e.target.value) || 0 })}
                                                    disabled={readOnly}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.unitSize || ''}
                                                    step="0.01"
                                                    className="h-8 text-xs text-center font-bold"
                                                    onChange={e => updateItem(idx, { unitSize: parseFloat(e.target.value) || 0 })}
                                                    disabled={readOnly}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        value={item.invoicedQty || ''}
                                                        step="0.001"
                                                        className={`h-8 text-xs font-bold text-right ${item.packingType === 'EVEN' ? 'bg-muted' : ''}`}
                                                        disabled={readOnly || item.packingType === 'EVEN'}
                                                        onChange={e => updateItem(idx, { invoicedQty: parseFloat(e.target.value) || 0 })}
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">{item.unitSymbol}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.rate || ''}
                                                    step="0.01"
                                                    className="h-8 text-xs font-bold text-right"
                                                    onChange={e => updateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
                                                    disabled={readOnly}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-right font-bold text-xs text-primary">
                                                    {item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </TableCell>
                                            {!readOnly && (
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRow(idx)}
                                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
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
