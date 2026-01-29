'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PurchaseOrder, PurchaseOrderType, PurchaseOrderItem, PackingType } from '@/app/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { createPurchaseOrder, updatePurchaseOrder } from '@/app/actions/fabtex/purchase-order'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

// Props Interfaces
interface POFormProps {
    initialData?: any // PurchaseOrder & { items: PurchaseOrderItem[] }
    accounts: any[]
    warehouses: any[]
    items: any[]
    colors: any[]
    brands: any[]
    itemGrades: any[]
    units: any[]
    packingUnits: any[]
    segment?: string
}

type POItemInput = {
    itemMasterId: string
    colorId?: string
    brandId?: string
    itemGradeId?: string

    packingUnitId?: string
    packingType: PackingType
    pcs: number
    unitSize: number
    quantity: number // This is Weight (Total)

    unitId?: number
    rate: number
    amount: number
    remarks?: string

    // UI Helpers
    itemName?: string
    unitSymbol?: string
    packingUnitSymbol?: string
    colorName?: string
    brandName?: string
    gradeName?: string
}

export function PurchaseOrderForm({
    initialData,
    accounts,
    warehouses,
    items,
    colors,
    brands,
    itemGrades,
    units,
    packingUnits,
    segment = 'YARN'
}: POFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Header State
    const [type, setType] = useState<PurchaseOrderType>(initialData?.type || 'LOCAL')
    const [warehouseId, setWarehouseId] = useState<string>(initialData?.warehouseId?.toString() || '')
    const [partyDetails, setPartyDetails] = useState({
        accountId: initialData?.accountId?.toString() || '',
        partyName: initialData?.partyName || ''
    })

    // Items State
    const [poItems, setPoItems] = useState<POItemInput[]>(
        initialData?.items.map((i: any) => ({
            ...i,
            colorId: i.colorId || undefined,
            brandId: i.brandId || undefined,
            itemGradeId: i.itemGradeId || undefined,
            unitId: i.unitId || undefined,
            remarks: i.remarks || undefined,
            packingType: i.packingType || 'EVEN',
            pcs: i.pcs || 0,
            unitSize: i.unitSize || 0,

            itemName: items.find(m => m.id === i.itemMasterId)?.name,
            unitSymbol: units.find(u => u.id === i.unitId)?.symbol,
            packingUnitSymbol: packingUnits.find(p => p.id === i.packingUnitId)?.symbol ||
                packingUnits.find(p => p.id === i.packingUnitId)?.name ||
                i.itemMaster?.packingUnit?.symbol ||
                i.itemMaster?.packingUnit?.name,
            colorName: colors.find(c => c.id === i.colorId)?.name,
            brandName: brands.find(b => b.id === i.brandId)?.name,
            gradeName: itemGrades.find(g => g.id === i.itemGradeId)?.name,
        })) || []
    )

    // Current Entry Selection State
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [currentItem, setCurrentItem] = useState<Partial<POItemInput>>({
        packingType: 'EVEN',
        pcs: 0,
        unitSize: 0,
        quantity: 0,
        rate: 0,
        amount: 0
    })

    const handleProductSelect = (itemId: string) => {
        const product = items.find(i => i.id === itemId)
        if (product) {
            setSelectedItem(product)
            setCurrentItem(prev => ({
                ...prev,
                itemMasterId: itemId,
                itemName: product.name,
                unitId: product.baseUnitId, // Default to base unit
                unitSymbol: product.baseUnit?.symbol,
                packingUnitId: product.packingUnitId || undefined,
                packingUnitSymbol: product.packingUnit?.symbol || product.packingUnit?.name || undefined
            }))
        }
    }

    // Auto calculate Weight and Amount
    useEffect(() => {
        const pcs = currentItem.pcs || 0
        const unitSize = currentItem.unitSize || 0
        const rate = currentItem.rate || 0

        let weight = currentItem.quantity || 0

        if (currentItem.packingType === 'EVEN') {
            weight = pcs * unitSize
        }

        const amount = weight * rate

        setCurrentItem(prev => ({
            ...prev,
            quantity: weight,
            amount: amount
        }))
    }, [currentItem.pcs, currentItem.unitSize, currentItem.rate, currentItem.packingType, currentItem.quantity])

    const addItem = () => {
        if (!currentItem.itemMasterId) {
            toast.error('Please select an Item')
            return
        }

        const newItem: POItemInput = {
            itemMasterId: currentItem.itemMasterId!,
            colorId: currentItem.colorId,
            brandId: currentItem.brandId,
            itemGradeId: currentItem.itemGradeId,
            packingType: currentItem.packingType || 'EVEN',
            pcs: currentItem.pcs || 0,
            unitSize: currentItem.unitSize || 0,
            quantity: currentItem.quantity || 0,
            rate: currentItem.rate || 0,
            amount: currentItem.amount || 0,
            unitId: currentItem.unitId,
            packingUnitId: currentItem.packingUnitId,
            remarks: currentItem.remarks,

            itemName: currentItem.itemName,
            unitSymbol: currentItem.unitSymbol,
            packingUnitSymbol: currentItem.packingUnitSymbol,
            colorName: colors.find(c => c.id === currentItem.colorId)?.name,
            brandName: brands.find(b => b.id === currentItem.brandId)?.name,
            gradeName: itemGrades.find(g => g.id === currentItem.itemGradeId)?.name,
        }

        setPoItems([...poItems, newItem])

        // Keep Item selected for multi-variant entry, but reset other fields
        setCurrentItem(prev => ({
            ...prev,
            colorId: undefined,
            brandId: undefined,
            itemGradeId: undefined,
            pcs: 0,
            unitSize: 0,
            quantity: 0,
            amount: 0
        }))
    }

    const removeItem = (index: number) => {
        setPoItems(poItems.filter((_, i) => i !== index))
    }

    const onSubmit = (formData: FormData) => {
        if (poItems.length === 0) {
            toast.error('Please add at least one item')
            return
        }

        formData.append('items', JSON.stringify(poItems))

        // Ensure controlled fields are in formData
        formData.set('type', type)
        formData.set('accountId', partyDetails.accountId)
        formData.set('partyName', partyDetails.partyName)
        formData.set('warehouseId', warehouseId)
        formData.set('segment', segment)

        startTransition(async () => {
            const result = initialData
                ? await updatePurchaseOrder(initialData.id, {}, formData)
                : await createPurchaseOrder({}, formData)

            if (result.success) {
                toast.success(initialData ? 'PO Updated' : 'PO Created')
                router.push('/dashboard/fab-tex/purchase/purchase-order')
            } else {
                toast.error(result.error || 'Failed to save PO')
            }
        })
    }

    const totalAmount = poItems.reduce((sum, item) => sum + item.amount, 0)

    return (
        <form action={onSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">

                {/* Type Selection */}
                <div className="space-y-2">
                    <Label>PO Type</Label>
                    <Select
                        name="type"
                        value={type}
                        onValueChange={(v) => setType(v as PurchaseOrderType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOCAL">Local</SelectItem>
                            <SelectItem value="IMPORT">Import</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Party Selection */}
                <div className="space-y-2">
                    <Label>Party (Vendor)</Label>
                    <Combobox
                        options={accounts.map(a => ({ label: a.name, value: a.id.toString() }))}
                        value={partyDetails.accountId}
                        onChange={(val) => setPartyDetails(p => ({ ...p, accountId: val }))}
                        placeholder="Select Vendor..."
                        searchPlaceholder="Search vendor..."
                        emptyText="No vendor found."
                    />
                </div>

                {/* Warehouse */}
                <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Combobox
                        options={warehouses.map(w => ({ label: w.name, value: w.id.toString() }))}
                        value={warehouseId}
                        onChange={setWarehouseId}
                        placeholder="Select Warehouse..."
                        searchPlaceholder="Search warehouse..."
                        emptyText="No warehouse found."
                    />
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                        type="date"
                        name="date"
                        defaultValue={initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        required
                    />
                </div>

                {/* Type Specific Fields */}
                <div className="space-y-2">
                    <Label>{type === 'IMPORT' ? 'Inv No' : 'Bill No'}</Label>
                    <Input
                        name="referenceNo"
                        defaultValue={initialData?.referenceNo || ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label>{type === 'IMPORT' ? 'Document Date' : 'Delivery Order Date'}</Label>
                    <Input
                        type="date"
                        name="documentDate"
                        defaultValue={initialData?.documentDate ? format(new Date(initialData.documentDate), 'yyyy-MM-dd') : ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label>File No</Label>
                    <Input
                        name="fileNo"
                        defaultValue={initialData?.fileNo || ''}
                        placeholder="User defined no"
                    />
                </div>
            </div>

            {/* ITEM SELECTION & PACKING LIST ENTRY */}
            <div className="border rounded-xl p-6 bg-card shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-bold text-xl">Item Packing List</h3>
                    <div className="text-sm text-muted-foreground italic">
                        Select an item first, then add multiple variants below.
                    </div>
                </div>

                {/* 1. Item Selection */}
                <div className="max-w-md space-y-2">
                    <Label className="text-primary font-semibold">Choose Product</Label>
                    <Combobox
                        options={items.map(i => ({ label: i.name, value: i.id }))}
                        value={currentItem.itemMasterId}
                        onChange={handleProductSelect}
                        placeholder="Choose Product..."
                        searchPlaceholder="Search product..."
                        emptyText="No product found."
                    />
                </div>

                {/* 2. Variant Sub-form (Visible only when item is selected) */}
                {currentItem.itemMasterId && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200">

                        {/* Color */}
                        <div className="md:col-span-3 lg:col-span-2 space-y-1">
                            <Label>Color</Label>
                            <Combobox
                                options={colors.map(c => ({ label: c.name, value: c.id }))}
                                value={currentItem.colorId}
                                onChange={(val) => setCurrentItem(p => ({ ...p, colorId: val }))}
                                placeholder="Select Color..."
                                searchPlaceholder="Search color..."
                                emptyText="No color found."
                            />
                        </div>

                        {/* Brand */}
                        <div className="md:col-span-3 lg:col-span-2 space-y-1">
                            <Label>Brand</Label>
                            <Combobox
                                options={brands.map(b => ({ label: b.name, value: b.id }))}
                                value={currentItem.brandId}
                                onChange={(val) => setCurrentItem(p => ({ ...p, brandId: val }))}
                                placeholder="Select Brand..."
                                searchPlaceholder="Search brand..."
                                emptyText="No brand found."
                            />
                        </div>

                        {/* Grade */}
                        <div className="md:col-span-3 lg:col-span-2 space-y-1">
                            <Label>Grade</Label>
                            <Combobox
                                options={itemGrades.map(g => ({ label: g.name, value: g.id }))}
                                value={currentItem.itemGradeId}
                                onChange={(val) => setCurrentItem(p => ({ ...p, itemGradeId: val }))}
                                placeholder="Select Grade..."
                                searchPlaceholder="Search grade..."
                                emptyText="No grade found."
                            />
                        </div>

                        {/* Packing Unit */}
                        <div className="md:col-span-3 lg:col-span-2 space-y-1">
                            <Label>Packing Unit</Label>
                            <Select
                                value={currentItem.packingUnitId}
                                onValueChange={(v) => {
                                    const pu = packingUnits.find(p => p.id === v);
                                    setCurrentItem(p => ({ ...p, packingUnitId: v, packingUnitSymbol: pu?.symbol || pu?.name }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="P. Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {packingUnits.map(pu => (
                                        <SelectItem key={pu.id} value={pu.id}>{pu.name} {pu.symbol ? `(${pu.symbol})` : ''}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Packing Type */}
                        <div className="md:col-span-4 lg:col-span-2 space-y-1">
                            <Label>Packing</Label>
                            <Select
                                value={currentItem.packingType}
                                onValueChange={(v) => setCurrentItem(p => ({ ...p, packingType: v as PackingType }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EVEN">Even</SelectItem>
                                    <SelectItem value="UNEVEN">Uneven</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Qty of UOM (Packages) */}
                        <div className="md:col-span-4 lg:col-span-2 space-y-1">
                            <Label>{currentItem.packingUnitSymbol || 'Pkgs'} Count</Label>
                            <Input
                                type="number"
                                placeholder={`e.g. 10 ${currentItem.packingUnitSymbol || 'Pkgs'}`}
                                value={currentItem.pcs || ''}
                                onChange={(e) => setCurrentItem(p => ({ ...p, pcs: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        {/* UOM Size (Qty per Package) */}
                        <div className="md:col-span-4 lg:col-span-2 space-y-1">
                            <Label>{currentItem.packingUnitSymbol || 'Pkg'} Size</Label>
                            <Input
                                type="number"
                                placeholder={`Weight per ${currentItem.packingUnitSymbol || 'Pkg'}`}
                                disabled={currentItem.packingType === 'UNEVEN'}
                                value={currentItem.unitSize || ''}
                                onChange={(e) => setCurrentItem(p => ({ ...p, unitSize: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        {/* Weight (Total Qty) */}
                        <div className="md:col-span-4 lg:col-span-2 space-y-1">
                            <Label>Weight (kg)</Label>
                            <Input
                                type="number"
                                readOnly={currentItem.packingType === 'EVEN'}
                                className={currentItem.packingType === 'EVEN' ? 'bg-muted font-bold' : 'border-primary'}
                                value={currentItem.quantity || ''}
                                onChange={(e) => setCurrentItem(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        {/* Rate */}
                        <div className="md:col-span-4 lg:col-span-2 space-y-1">
                            <Label>Rate (Opt)</Label>
                            <Input
                                type="number"
                                placeholder="Optional"
                                value={currentItem.rate || ''}
                                onChange={(e) => setCurrentItem(p => ({ ...p, rate: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>

                        {/* Amount */}
                        <div className="md:col-span-6 lg:col-span-3 space-y-1">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                readOnly
                                value={currentItem.amount?.toFixed(2) || '0.00'}
                                className="bg-muted font-bold"
                            />
                        </div>

                        {/* Add BTN */}
                        <div className="md:col-span-6 lg:col-span-3">
                            <Button type="button" onClick={addItem} className="w-full">
                                <Plus className="h-4 w-4 mr-1" /> Add Item
                            </Button>
                        </div>

                    </div>
                )}

                {/* 3. Items List Table */}
                <div className="border rounded-lg overflow-hidden border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800">
                            <TableRow>
                                <TableHead className="font-bold">Product</TableHead>
                                <TableHead className="font-bold">Variant (Clr/Grd/Brnd)</TableHead>
                                <TableHead className="font-bold">Packing</TableHead>
                                <TableHead className="font-bold">P. Unit</TableHead>
                                <TableHead className="font-bold text-center">{poItems.find(i => i.packingUnitSymbol)?.packingUnitSymbol || 'Pkgs'}</TableHead>
                                <TableHead className="font-bold text-center">Weight</TableHead>
                                <TableHead className="font-bold text-right">Rate</TableHead>
                                <TableHead className="font-bold text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {poItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-32 text-muted-foreground">
                                        No variant rows added yet. Select an item and fill the form above.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                poItems.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="font-semibold">{item.itemName} ({item.unitSymbol})</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.colorName && <BadgeSmall outline>{item.colorName}</BadgeSmall>}
                                                {item.gradeName && <BadgeSmall>{item.gradeName}</BadgeSmall>}
                                                {item.brandName && <BadgeSmall outline>{item.brandName}</BadgeSmall>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span className="font-medium">{item.packingType}</span>
                                                {item.packingType === 'EVEN' && (
                                                    <span className="text-muted-foreground">{item.pcs} x {item.unitSize}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs font-medium">{item.packingUnitSymbol || '-'}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.pcs ? `${item.pcs} ${item.packingUnitSymbol || 'Pkgs'}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{item.quantity} {item.unitSymbol}</TableCell>
                                        <TableCell className="text-right">{item.rate.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            {item.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Totals */}
                <div className="flex justify-end pt-2">
                    <div className="flex gap-6 items-baseline p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="font-medium text-muted-foreground uppercase tracking-widest text-xs">Net Payable:</span>
                        <span className="text-3xl font-black text-primary">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(totalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 p-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Discard Changes
                </Button>
                <Button type="submit" disabled={isPending} size="lg" className="px-10">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Update Purchase Order' : 'Confirm & Save Purchase Order'}
                </Button>
            </div>
        </form >
    )
}

function BadgeSmall({ children, outline }: { children: React.ReactNode, outline?: boolean }) {
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${outline ? 'border border-slate-300 text-slate-600' : 'bg-slate-200 text-slate-700'}`}>
            {children}
        </span>
    )
}
