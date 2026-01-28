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
import { createPurchaseInvoice, updatePurchaseInvoice, debugPOData } from '@/app/actions/fabtex/purchase-invoice'

interface InvoiceFormProps {
    purchaseOrders: any[]
    accounts: any[]
    itemMasters: any[]
    units: any[]
    colors: any[]
    brands: any[]
    itemGrades: any[]
    packingUnits: any[]
    allEligibleGRNs?: any[]
    initialData?: any
    invoiceId?: string
    readOnly?: boolean
}

export function InvoiceForm({
    purchaseOrders,
    accounts,
    itemMasters,
    units,
    colors,
    brands,
    itemGrades,
    packingUnits,
    allEligibleGRNs = [],
    initialData,
    invoiceId,
    readOnly = false
}: InvoiceFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        console.log('InvoiceForm mounted. purchaseOrders:', purchaseOrders)
    }, [purchaseOrders])
    const [invoiceMode, setInvoiceMode] = useState<'PO' | 'GRN' | 'DIRECT'>(initialData?.items?.[0]?.grnId ? 'GRN' : (initialData?.purchaseOrderId ? 'PO' : (initialData?.accountId ? 'DIRECT' : 'PO')))

    // Header States
    const [selectedPO, setSelectedPO] = useState<any>(initialData?.purchaseOrder || null)
    const [selectedGRNId, setSelectedGRNId] = useState<string>(initialData?.items?.[0]?.grnId || '')
    const [selectedVendorId, setSelectedVendorId] = useState<string>(initialData?.accountId?.toString() || '')
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`)
    const [supplierInvoiceNo, setSupplierInvoiceNo] = useState(initialData?.supplierInvoiceNo || '')
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [remarks, setRemarks] = useState(initialData?.remarks || '')

    // Items State
    const [items, setItems] = useState<any[]>(initialData?.items?.map((item: any) => ({
        id: item.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        grnItemId: item.grnItemId,
        itemMasterId: item.itemMasterId || item.purchaseOrderItem?.itemMasterId,
        itemName: item.itemMaster?.name || item.purchaseOrderItem?.itemMaster?.name,
        colorId: item.colorId || item.purchaseOrderItem?.colorId,
        brandId: item.brandId || item.purchaseOrderItem?.brandId,
        itemGradeId: item.itemGradeId || item.purchaseOrderItem?.itemGradeId,
        unitId: item.unitId || item.purchaseOrderItem?.unitId,
        unitSymbol: item.unit?.symbol || item.purchaseOrderItem?.unit?.symbol,
        packingLabel: item.purchaseOrderItem?.packingUnit?.symbol || item.purchaseOrderItem?.packingUnit?.name || item.purchaseOrderItem?.itemMaster?.packingUnit?.symbol || item.purchaseOrderItem?.itemMaster?.packingUnit?.name || 'Qty',
        orderedQty: item.purchaseOrderItem?.quantity || 0,
        alreadyInvoiced: 0,
        remainingQty: item.purchaseOrderItem?.quantity || 0,
        invoicedQty: item.invoicedQty,
        rate: item.rate,
        amount: item.amount,
        isGrnItem: !!item.grnItemId
    })) || [])

    // PO Change Handlers
    const onPOChange = (poId: string) => {
        console.log('onPOChange triggered for ID:', poId)
        const po = purchaseOrders.find(p => p.id === poId)
        if (!po) {
            console.error('PO not found in list for ID:', poId)
            return
        }
        console.log('Found PO details:', {
            id: po.id,
            poNumber: po.poNumber,
            itemsCount: po.items?.length,
            grnsCount: po.grns?.length,
            items: po.items,
            grns: po.grns
        })
        setSelectedPO(po)
        setInvoiceMode('PO')
        setSelectedVendorId(po.accountId?.toString() || '')
        setSelectedGRNId('') // Reset GRN selection

        // Trigger server-side debug log
        debugPOData(poId)

        const invoiceItems = po.items.map((item: any) => {
            console.log('Mapping PO Item:', item)
            const alreadyInvoiced = (item.invoiceItems || []).reduce((sum: number, ii: any) => sum + ii.invoicedQty, 0)
            const remaining = (item.quantity || 0) - alreadyInvoiced

            return {
                purchaseOrderItemId: item.id,
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
        console.log('Generated Invoice Items:', invoiceItems)
        setItems(invoiceItems)
    }

    const onGRNChange = (grnId: string) => {
        console.log('onGRNChange triggered for ID:', grnId)
        setSelectedGRNId(grnId)
        if (!selectedPO) return

        if (grnId === 'full_po') {
            onPOChange(selectedPO.id)
            return
        }

        const grn = selectedPO.grns.find((g: any) => g.id === grnId)
        if (!grn) {
            console.error('GRN not found in selected PO for ID:', grnId)
            return
        }
        console.log('Found GRN:', grn)

        // Map GRN items back to PO items
        const invoiceItems = grn.items.map((grnItem: any) => {
            const poItem = selectedPO.items.find((poi: any) => poi.id === grnItem.purchaseOrderItemId)

            return {
                purchaseOrderItemId: grnItem.purchaseOrderItemId,
                grnItemId: grnItem.id,
                itemMasterId: grnItem.itemMasterId,
                itemName: grnItem.itemMaster.name,
                colorId: grnItem.colorId || poItem?.colorId,
                brandId: grnItem.brandId || poItem?.brandId,
                itemGradeId: grnItem.itemGradeId || poItem?.itemGradeId,
                unitId: grnItem.unitId,
                unitSymbol: grnItem.unit?.symbol,
                packingLabel: grnItem.packingUnit?.symbol || grnItem.packingUnit?.name || grnItem.itemMaster?.packingUnit?.symbol || grnItem.itemMaster?.packingUnit?.name || poItem?.packingUnit?.symbol || poItem?.packingUnit?.name || poItem?.itemMaster?.packingUnit?.symbol || poItem?.itemMaster?.packingUnit?.name || 'Qty',
                orderedQty: poItem?.quantity || 0,
                alreadyInvoiced: 0, // In GRN context, we usually bill what we receive
                remainingQty: grnItem.receivedQty,
                invoicedQty: grnItem.receivedQty,
                rate: poItem?.rate || 0,
                amount: grnItem.receivedQty * (poItem?.rate || 0),
                isGrnItem: true
            }
        })
        setItems(invoiceItems)
    }

    const onDirectGRNChange = (grnId: string) => {
        console.log('onDirectGRNChange triggered for ID:', grnId)
        const grn = allEligibleGRNs.find(g => g.id === grnId)
        if (!grn) return

        // Find the PO in our list to get full items (with alreadyInvoiced info)
        const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId)
        if (!po) return

        setSelectedPO(po)
        setInvoiceMode('GRN')
        setSelectedGRNId(grnId)
        setSelectedVendorId(po.accountId?.toString() || '')

        // Trigger server-side debug log
        debugPOData(po.id)

        // Map items from this specific GRN
        const invoiceItems = grn.items.map((grnItem: any) => {
            const poItem = po.items.find((poi: any) => poi.id === grnItem.purchaseOrderItemId)
            return {
                purchaseOrderItemId: grnItem.purchaseOrderItemId,
                grnItemId: grnItem.id,
                itemMasterId: grnItem.itemMasterId,
                itemName: grnItem.itemMaster.name,
                colorId: grnItem.colorId || poItem?.colorId,
                brandId: grnItem.brandId || poItem?.brandId,
                itemGradeId: grnItem.itemGradeId || poItem?.itemGradeId,
                unitId: grnItem.unitId,
                unitSymbol: grnItem.unit?.symbol,
                packingLabel: grnItem.packingUnit?.symbol || grnItem.packingUnit?.name || grnItem.itemMaster?.packingUnit?.symbol || grnItem.itemMaster?.packingUnit?.name || poItem?.packingUnit?.symbol || poItem?.packingUnit?.name || poItem?.itemMaster?.packingUnit?.symbol || poItem?.itemMaster?.packingUnit?.name || 'Qty',
                orderedQty: poItem?.quantity || 0,
                alreadyInvoiced: (poItem?.invoiceItems || []).reduce((sum: number, ii: any) => sum + ii.invoicedQty, 0),
                remainingQty: grnItem.receivedQty,
                invoicedQty: grnItem.receivedQty,
                rate: poItem?.rate || 0,
                amount: grnItem.receivedQty * (poItem?.rate || 0),
                isGrnItem: true
            }
        })
        setItems(invoiceItems)
    }

    // Direct Mode Handlers
    const addDirectItem = () => {
        setItems([...items, {
            purchaseOrderItemId: null,
            grnItemId: null,
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
                // Calculate amount if qty or rate changes
                if ('invoicedQty' in updates || 'rate' in updates) {
                    newItem.amount = (newItem.invoicedQty || 0) * (newItem.rate || 0)
                }
                // Update labels if item master changes
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

        if ((invoiceMode === 'PO' || invoiceMode === 'GRN') && !selectedPO) {
            toast.error(`Please select a ${invoiceMode === 'PO' ? 'Purchase Order' : 'Goods Receipt'}`)
            return
        }

        if (invoiceMode === 'DIRECT' && !selectedVendorId) {
            toast.error('Please select a Vendor')
            return
        }

        const validItems = items.filter(it => it.invoicedQty > 0 || it.itemMasterId)
        if (validItems.length === 0) {
            toast.error('No items to invoice')
            return
        }

        setLoading(true)
        const formData = new FormData()
        if ((invoiceMode === 'PO' || invoiceMode === 'GRN') && selectedPO) {
            formData.append('purchaseOrderId', selectedPO.id)
        }
        if (selectedVendorId) formData.append('accountId', selectedVendorId)

        formData.append('invoiceNumber', invoiceNumber)
        formData.append('supplierInvoiceNo', supplierInvoiceNo)
        formData.append('date', date)
        formData.append('remarks', remarks)
        formData.append('items', JSON.stringify(validItems))

        let result
        if (invoiceId) {
            result = await updatePurchaseInvoice(invoiceId, { success: false }, formData)
        } else {
            result = await createPurchaseInvoice({ success: false }, formData)
        }

        setLoading(true) // Keep loading until redirect

        if (result.success) {
            toast.success(result.message)
            router.push('/dashboard/fab-tex/purchase/invoice')
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
                            {invoiceId ? 'Edit Purchase Invoice' : 'Generate Purchase Invoice'}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={invoiceMode === 'PO' ? 'default' : 'outline'}
                                onClick={() => {
                                    setInvoiceMode('PO')
                                    setItems([])
                                    setSelectedPO(null)
                                }}
                                className="rounded-full"
                                size="sm"
                                disabled={readOnly}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                From PO
                            </Button>
                            <Button
                                type="button"
                                variant={invoiceMode === 'GRN' ? 'default' : 'outline'}
                                onClick={() => {
                                    setInvoiceMode('GRN')
                                    setItems([])
                                    setSelectedPO(null)
                                    setSelectedGRNId('')
                                }}
                                className="rounded-full"
                                size="sm"
                                disabled={readOnly}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                From GRN
                            </Button>
                            <Button
                                type="button"
                                variant={invoiceMode === 'DIRECT' ? 'default' : 'outline'}
                                onClick={() => {
                                    setInvoiceMode('DIRECT')
                                    setItems([])
                                    setSelectedPO(null)
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
                        {invoiceMode === 'PO' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Select Purchase Order</Label>
                                <Select
                                    onValueChange={onPOChange}
                                    defaultValue={selectedPO?.id}
                                    disabled={!!invoiceId}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary transition-colors">
                                        <SelectValue placeholder="Search PO..." />
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
                        )}

                        {invoiceMode === 'GRN' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Select Goods Receipt (GRN)</Label>
                                <Select
                                    onValueChange={onDirectGRNChange}
                                    defaultValue={selectedGRNId}
                                    disabled={!!invoiceId}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary transition-colors">
                                        <SelectValue placeholder="Search GRN..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allEligibleGRNs.map(grn => (
                                            <SelectItem key={grn.id} value={grn.id}>
                                                {grn.id.slice(-8)} - {grn.vendorName} ({new Date(grn.date).toLocaleDateString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {invoiceMode === 'DIRECT' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Vendor (Account)</Label>
                                <Select
                                    onValueChange={setSelectedVendorId}
                                    defaultValue={selectedVendorId}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary transition-colors">
                                        <SelectValue placeholder="Select Vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.filter(a => a.type === 'LIABILITY' || a.name.toLowerCase().includes('vendor')).map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.name} ({acc.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {invoiceMode === 'PO' && selectedPO && (selectedPO.grns?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Map from GRN (Optional)</Label>
                                <Select
                                    onValueChange={onGRNChange}
                                    value={selectedGRNId}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger className="bg-background/50 border-primary/20">
                                        <SelectValue placeholder="Select GRN..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_po">Full PO Mapping</SelectItem>
                                        {selectedPO.grns.map((grn: any) => (
                                            <SelectItem key={grn.id} value={grn.id}>
                                                GRN: {new Date(grn.date).toLocaleDateString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* In-UI Debug Info for User */}
                        {invoiceMode === 'PO' && selectedPO && !readOnly && (
                            <div className="p-3 bg-muted/50 rounded-lg border border-primary/10 text-xs space-y-1">
                                <p className="font-bold text-primary">Debug Info:</p>
                                <p>PO: <span className="text-foreground">{selectedPO.poNumber}</span></p>
                                <p>Status: <span className="text-foreground">{selectedPO.status}</span></p>
                                <p>Items in PO: <span className="text-foreground">{selectedPO.items?.length || 0}</span></p>
                                <p>GRNs for this PO: <span className="text-foreground">{selectedPO.grns?.length || 0}</span></p>
                                {(selectedPO.items?.length ?? 0) === 0 && (
                                    <p className="text-destructive font-semibold">⚠️ This PO has NO ITEMS!</p>
                                )}
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
                            <Label className="text-sm font-semibold">Supplier Invoice No</Label>
                            <Input
                                value={supplierInvoiceNo}
                                onChange={e => setSupplierInvoiceNo(e.target.value)}
                                placeholder="Ref #"
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
                                                    {item.isGrnItem ? (
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
                                                    ) : invoiceMode === 'PO' ? (
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
                                                            <div className="flex gap-2">
                                                                <Select value={item.colorId} onValueChange={(v) => updateItem(idx, { colorId: v })}>
                                                                    <SelectTrigger className="h-7 text-[10px]"><SelectValue placeholder="Color" /></SelectTrigger>
                                                                    <SelectContent>{colors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                                <Select value={item.brandId} onValueChange={(v) => updateItem(idx, { brandId: v })}>
                                                                    <SelectTrigger className="h-7 text-[10px]"><SelectValue placeholder="Brand" /></SelectTrigger>
                                                                    <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                                <Select value={item.itemGradeId} onValueChange={(v) => updateItem(idx, { itemGradeId: v })}>
                                                                    <SelectTrigger className="h-7 text-[10px]"><SelectValue placeholder="Grade" /></SelectTrigger>
                                                                    <SelectContent>{itemGrades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </div>
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
                                                        disabled={readOnly || item.isGrnItem}
                                                        className={`h-9 font-medium border-primary/10 ${item.isGrnItem ? 'bg-muted opacity-80 cursor-not-allowed' : ''}`}
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
                            placeholder="Additional instructions, payment terms, etc..."
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
                                disabled={loading || (invoiceMode === 'PO' && !selectedPO) || (invoiceMode === 'DIRECT' && !selectedVendorId)}
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

