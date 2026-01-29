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
import { Trash2, Package, Plus, Search, Undo2, Save, FileText, Printer, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { createDeliveryOrder, updateDeliveryOrder } from '@/app/actions/fabtex/delivery-order'
import { Combobox } from '@/components/ui/combobox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DOFormProps {
    salesOrders: any[]
    accounts?: any[]
    itemMasters?: any[]
    units?: any[]
    colors?: any[]
    brands?: any[]
    itemGrades?: any[]
    packingUnits?: any[]
    warehouses?: any[]
    initialData?: any
    doId?: string
    segment?: string
}

export function DeliveryOrderForm({
    salesOrders = [],
    accounts = [],
    itemMasters = [],
    units = [],
    colors = [],
    brands = [],
    itemGrades = [],
    packingUnits = [],
    warehouses = [],
    initialData,
    doId,
    segment = 'YARN'
}: DOFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'SO' | 'DIRECT'>(initialData?.salesOrderId ? 'SO' : (initialData?.accountId ? 'DIRECT' : 'SO'))

    // Header State
    const [selectedSO, setSelectedSO] = useState<any>(initialData?.salesOrder || null)
    const [selectedAccountId, setSelectedAccountId] = useState<string>(initialData?.accountId?.toString() || '')
    const [doNumber, setDoNumber] = useState(initialData?.doNumber || `DO-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [gatePassNo, setGatePassNo] = useState(initialData?.gatePassNo || '')
    const [vehicleNo, setVehicleNo] = useState(initialData?.vehicleNo || '')
    const [remarks, setRemarks] = useState(initialData?.remarks || '')
    const [warehouseId, setWarehouseId] = useState<string>(initialData?.warehouseId?.toString() || '')
    const [warehouseRefNo, setWarehouseRefNo] = useState(initialData?.warehouseRefNo || '')

    // Items State
    const [items, setItems] = useState<any[]>(initialData?.items?.map((it: any) => ({
        salesOrderItemId: it.salesOrderItemId,
        itemMasterId: it.itemMasterId,
        itemName: it.itemMaster.name,
        colorId: it.colorId,
        colorName: it.color?.name,
        brandId: it.brandId,
        brandName: it.brand?.name,
        itemGradeId: it.itemGradeId,
        gradeName: it.itemGrade?.name,
        unitId: it.unitId,
        unitSymbol: it.unit?.symbol,
        deliveredQty: it.deliveredQty,
        pcs: it.pcs || 0,
        packingUnitId: it.packingUnitId,
        packingUnitSymbol: it.packingUnit?.symbol || it.packingUnit?.name || it.itemMaster?.packingUnit?.symbol || it.itemMaster?.packingUnit?.name,
        packingType: it.packingType || 'EVEN',
        unitSize: it.unitSize || 0,
        remainingQty: 999999,
        orderedQty: 999999
    })) || [])

    // State for direct item entry
    const [currentItem, setCurrentItem] = useState<any>({
        itemMasterId: '',
        colorId: '',
        brandId: '',
        itemGradeId: '',
        packingUnitId: '',
        unitId: '',
        packingType: 'EVEN',
        pcs: 0,
        unitSize: 0,
        deliveredQty: 0
    })

    // Handle SO Selection
    const onSOChange = (soId: string) => {
        const so = salesOrders.find(p => p.id === soId)
        if (!so) return
        setSelectedSO(so)
        setSelectedAccountId(so.accountId?.toString() || '')

        const doItems = so.items.map((item: any) => {
            const alreadyDelivered = item.deliveryOrderItems.reduce((sum: number, di: any) => sum + di.deliveredQty, 0)
            const remaining = item.quantity - alreadyDelivered

            return {
                salesOrderItemId: item.id,
                itemMasterId: item.itemMasterId,
                itemName: item.itemMaster.name,
                colorId: item.colorId,
                colorName: item.color?.name,
                brandId: item.brandId,
                brandName: item.brand?.name,
                itemGradeId: item.itemGradeId,
                gradeName: item.itemGrade?.name,
                unitId: item.unitId,
                unitSymbol: item.unit?.symbol,
                orderedQty: item.quantity,
                alreadyDelivered,
                remainingQty: remaining > 0 ? remaining : 0,
                deliveredQty: remaining > 0 ? remaining : 0,
                pcs: item.pcs || 0,
                unitSize: item.unitSize || 0,
                packingType: item.packingType || 'EVEN',
                packingUnitId: item.packingUnitId,
                packingUnitSymbol: item.packingUnit?.symbol || item.packingUnit?.name || item.itemMaster?.packingUnit?.symbol || item.itemMaster?.packingUnit?.name
            }
        })
        setItems(doItems)
    }

    // Handle Mode Change
    const handleModeChange = (val: string) => {
        if (doId) return // Disable mode change in edit
        setMode(val as any)
        setItems([])
        setSelectedSO(null)
        setSelectedAccountId('')
    }

    const addItemManually = () => {
        if (!currentItem.itemMasterId || !currentItem.deliveredQty) {
            toast.error('Please select an item and enter quantity')
            return
        }

        const product = itemMasters.find(m => m.id === currentItem.itemMasterId)
        const unit = units.find(u => u.id === parseInt(currentItem.unitId))
        const pUnit = packingUnits.find(p => p.id === currentItem.packingUnitId)
        const color = colors.find(c => c.id === currentItem.colorId)
        const brand = brands.find(b => b.id === currentItem.brandId)
        const grade = itemGrades.find(g => g.id === currentItem.itemGradeId)

        const newItem = {
            ...currentItem,
            itemName: product?.name,
            unitSymbol: unit?.symbol || product?.baseUnit?.symbol,
            packingUnitSymbol: pUnit?.symbol || pUnit?.name || product?.packingUnit?.symbol || product?.packingUnit?.name,
            colorName: color?.name,
            brandName: brand?.name,
            gradeName: grade?.name,
            unitId: currentItem.unitId || product?.baseUnitId,
            packingUnitId: currentItem.packingUnitId || product?.packingUnitId
        }

        setItems([...items, newItem])
        setCurrentItem({
            itemMasterId: '',
            colorId: '',
            brandId: '',
            itemGradeId: '',
            packingUnitId: '',
            unitId: '',
            packingType: 'EVEN',
            pcs: 0,
            unitSize: 0,
            deliveredQty: 0
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (mode === 'SO' && !selectedSO) {
            toast.error('Please select a Sales Order')
            return
        }
        if (mode === 'DIRECT' && !selectedAccountId) {
            toast.error('Please select a Customer')
            return
        }

        const validItems = items.filter(it => it.deliveredQty > 0)
        if (validItems.length === 0) {
            toast.error('No items to deliver')
            return
        }

        setLoading(true)
        const formData = new FormData()
        if (mode === 'SO') formData.append('salesOrderId', selectedSO.id)
        if (selectedAccountId) formData.append('accountId', selectedAccountId)

        formData.append('doNumber', doNumber)
        formData.append('date', date)
        formData.append('gatePassNo', gatePassNo)
        formData.append('vehicleNo', vehicleNo)
        formData.append('remarks', remarks)
        formData.append('warehouseId', warehouseId)
        formData.append('warehouseRefNo', warehouseRefNo)
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
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xl font-bold">
                        {doId ? 'Edit Delivery Order' : 'Dispatch Goods (DO)'}
                    </CardTitle>
                    {!doId && (
                        <Tabs value={mode} onValueChange={handleModeChange} className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="SO">From Sales Order</TabsTrigger>
                                <TabsTrigger value="DIRECT">Direct Delivery</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-muted/20 p-4 rounded-lg">
                        <div className="md:col-span-2 space-y-2">
                            {mode === 'SO' ? (
                                <>
                                    <Label className="text-blue-600 font-semibold">Sales Order</Label>
                                    <Select onValueChange={onSOChange} value={selectedSO?.id} disabled={!!doId}>
                                        <SelectTrigger className="bg-white">
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
                                </>
                            ) : (
                                <>
                                    <Label className="text-blue-600 font-semibold">Customer (Direct)</Label>
                                    <Combobox
                                        options={accounts.map(a => ({ label: a.name, value: a.id.toString() }))}
                                        value={selectedAccountId}
                                        onChange={setSelectedAccountId}
                                        placeholder="Search customer..."
                                    />
                                </>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">DO Number</Label>
                            <Input value={doNumber} onChange={e => setDoNumber(e.target.value)} required className="bg-white font-mono uppercase" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-orange-600">Gate Pass No</Label>
                            <Input value={gatePassNo} onChange={e => setGatePassNo(e.target.value)} placeholder="GP-XXXX" className="bg-white" />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-emerald-600">Warehouse / Godown</Label>
                            <Select value={warehouseId} onValueChange={setWarehouseId}>
                                <SelectTrigger className="bg-white">
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
                            <Label className="font-semibold text-emerald-600">Godown Ref</Label>
                            <Input value={warehouseRefNo} onChange={e => setWarehouseRefNo(e.target.value)} placeholder="Ref/Challan No" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-blue-600 font-semibold">Vehicle No</Label>
                            <Input value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="Vehicle Reg No" className="bg-white" />
                        </div>
                        {selectedSO?.fileNo && (
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">SO File No</Label>
                                <div className="p-2 border rounded-md bg-white font-medium text-xs">
                                    {selectedSO.fileNo}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Entry for Direct Mode */}
                    {mode === 'DIRECT' && (
                        <div className="border border-primary/20 bg-primary/5 p-4 rounded-lg space-y-4">
                            <h3 className="font-bold flex items-center gap-2 text-primary">
                                <Plus className="h-4 w-4" /> Add Item Manually
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs">Item Master</Label>
                                    <Combobox
                                        options={itemMasters.map(m => ({ label: m.name, value: m.id }))}
                                        value={currentItem.itemMasterId}
                                        onChange={(val: string) => {
                                            const m = itemMasters.find(it => it.id === val);
                                            setCurrentItem({
                                                ...currentItem,
                                                itemMasterId: val,
                                                unitId: m?.baseUnitId?.toString(),
                                                packingUnitId: m?.packingUnitId
                                            })
                                        }}
                                        placeholder="Search item..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Color</Label>
                                    <Select value={currentItem.colorId} onValueChange={(val) => setCurrentItem({ ...currentItem, colorId: val })}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Color" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">N/A</SelectItem>
                                            {colors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Brand</Label>
                                    <Select value={currentItem.brandId} onValueChange={(val) => setCurrentItem({ ...currentItem, brandId: val })}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Brand" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">N/A</SelectItem>
                                            {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Grade</Label>
                                    <Select value={currentItem.itemGradeId} onValueChange={(val) => setCurrentItem({ ...currentItem, itemGradeId: val })}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Grade" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">N/A</SelectItem>
                                            {itemGrades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">P. Type</Label>
                                    <Select value={currentItem.packingType} onValueChange={(val) => {
                                        setCurrentItem({
                                            ...currentItem,
                                            packingType: val,
                                            deliveredQty: val === 'EVEN' ? currentItem.pcs * currentItem.unitSize : currentItem.deliveredQty
                                        })
                                    }}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EVEN">Even</SelectItem>
                                            <SelectItem value="UNEVEN">Uneven</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">P.Unit</Label>
                                    <Select value={currentItem.packingUnitId} onValueChange={(val) => setCurrentItem({ ...currentItem, packingUnitId: val })}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Unit" /></SelectTrigger>
                                        <SelectContent>
                                            {packingUnits.map(p => <SelectItem key={p.id} value={p.id}>{p.symbol || p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Pcs/Pkgs</Label>
                                        <Input type="number" className="bg-white font-bold" value={currentItem.pcs || ''} onChange={e => {
                                            const pcs = parseFloat(e.target.value) || 0;
                                            setCurrentItem({
                                                ...currentItem,
                                                pcs,
                                                deliveredQty: currentItem.packingType === 'EVEN' ? pcs * currentItem.unitSize : currentItem.deliveredQty
                                            })
                                        }} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Unit Size</Label>
                                        <Input type="number" className="bg-white font-bold" value={currentItem.unitSize || ''} onChange={e => {
                                            const sz = parseFloat(e.target.value) || 0;
                                            setCurrentItem({
                                                ...currentItem,
                                                unitSize: sz,
                                                deliveredQty: currentItem.packingType === 'EVEN' ? currentItem.pcs * sz : currentItem.deliveredQty
                                            })
                                        }} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-primary">Total Qty</Label>
                                        <Input type="number" className={`bg-white font-bold ${currentItem.packingType === 'EVEN' ? 'bg-muted' : ''}`} value={currentItem.deliveredQty || ''} onChange={e => setCurrentItem({ ...currentItem, deliveredQty: parseFloat(e.target.value) || 0 })} disabled={currentItem.packingType === 'EVEN'} />
                                    </div>
                                </div>
                                <div className="flex items-end pb-0.5">
                                    <Button type="button" onClick={addItemManually} className="w-full h-10 gap-2">
                                        <Plus className="h-4 w-4" /> Add to List
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className="rounded-md border mt-4 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Item Details</TableHead>
                                        <TableHead>P. Unit</TableHead>
                                        <TableHead>P. Type</TableHead>
                                        {mode === 'SO' && <TableHead>Ordered/Rem</TableHead>}
                                        <TableHead className="w-[100px]">Pkgs</TableHead>
                                        <TableHead className="w-[100px]">Size</TableHead>
                                        <TableHead className="w-[150px]">Disp. Qty</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <div className="font-bold flex items-center gap-1 text-primary">
                                                    <Package className="h-3 w-3" /> {item.itemName}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground ml-4">
                                                    {item.colorName || 'No Color'} • {item.gradeName || 'No Grade'} • {item.brandName || 'No Brand'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {item.packingUnitSymbol || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={item.packingType || 'EVEN'}
                                                    onValueChange={val => {
                                                        setItems(prev => prev.map((it, i) => {
                                                            if (i === idx) {
                                                                const newRaw = { ...it, packingType: val }
                                                                if (val === 'EVEN') {
                                                                    newRaw.deliveredQty = (it.pcs || 0) * (it.unitSize || 0)
                                                                }
                                                                return newRaw
                                                            }
                                                            return it
                                                        }))
                                                    }}
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
                                                    value={item.unitSize || ''}
                                                    step="0.01"
                                                    className="h-8 text-xs text-center font-bold"
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
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        value={item.deliveredQty || ''}
                                                        step="0.01"
                                                        className={`h-8 text-xs font-bold text-right ${item.packingType === 'EVEN' ? 'bg-muted' : ''}`}
                                                        disabled={item.packingType === 'EVEN'}
                                                        onChange={e => {
                                                            const val = parseFloat(e.target.value) || 0
                                                            setItems(prev => prev.map((it, i) =>
                                                                i === idx ? { ...it, deliveredQty: val } : it
                                                            ))
                                                        }}
                                                    />
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.unitSymbol}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        setItems(prev => prev.filter((_, i) => i !== idx))
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="space-y-2 bg-muted/20 p-4 rounded-lg">
                        <Label className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Final Remarks
                        </Label>
                        <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any shipment notes, transport details, etc..." className="bg-white min-h-[80px]" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t bg-muted/10 p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                        {items.length} Item(s) in Ship List
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="h-10">Cancel</Button>
                        <Button type="submit" disabled={loading} className="h-10 min-w-[120px] shadow-md shadow-primary/20">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" /> {doId ? 'Update DO' : 'Post Shipment'}
                                </span>
                            )}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
        </svg>
    )
}
