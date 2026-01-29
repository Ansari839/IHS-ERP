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
import { Plus, Trash2, Undo2, FileText } from 'lucide-react'
import { createPurchaseReturn } from '@/app/actions/fabtex/purchase-return'

interface ReturnFormProps {
    invoices: any[]
    accounts: any[]
    itemMasters: any[]
    units: any[]
    colors: any[]
    brands: any[]
    itemGrades: any[]
    segment?: string
}

export function ReturnForm({
    invoices,
    accounts,
    itemMasters,
    units,
    colors,
    brands,
    itemGrades,
    segment = 'YARN'
}: ReturnFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [returnNumber, setReturnNumber] = useState(`PR-${Date.now().toString().slice(-6)}`)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [remarks, setRemarks] = useState('')
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [selectedVendorId, setSelectedVendorId] = useState<string>('')
    const [items, setItems] = useState<any[]>([])

    const onInvoiceChange = (invoiceId: string) => {
        const inv = invoices.find(i => i.id === invoiceId)
        if (!inv) return
        setSelectedInvoice(inv)
        setSelectedVendorId(inv.accountId?.toString() || '')

        const returnItems = inv.items.map((item: any) => ({
            purchaseInvoiceItemId: item.id,
            itemMasterId: item.itemMasterId,
            itemName: item.itemMaster?.name || 'Unknown Item',
            colorId: item.colorId,
            brandId: item.brandId,
            itemGradeId: item.itemGradeId,
            unitId: item.unitId,
            unitSymbol: item.unit?.symbol,
            invoicedQty: item.invoicedQty,
            returnedQty: 0,
            rate: item.rate,
            amount: 0
        }))
        setItems(returnItems)
    }

    const updateItem = (index: number, updates: any) => {
        setItems(prev => prev.map((it, i) => {
            if (i === index) {
                const newItem = { ...it, ...updates }
                if ('returnedQty' in updates || 'rate' in updates) {
                    newItem.amount = (newItem.returnedQty || 0) * (newItem.rate || 0)
                }
                return newItem
            }
            return it
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validItems = items.filter(it => it.returnedQty > 0)
        if (validItems.length === 0) {
            toast.error('Please specify quantities to return')
            return
        }

        setLoading(true)
        const formData = new FormData()
        if (selectedInvoice) formData.append('purchaseInvoiceId', selectedInvoice.id)
        if (selectedVendorId) formData.append('accountId', selectedVendorId)
        formData.append('returnNumber', returnNumber)
        formData.append('date', date)
        formData.append('remarks', remarks)
        formData.append('items', JSON.stringify(validItems))
        formData.append('segment', segment)

        const result = await createPurchaseReturn({ success: false }, formData)
        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            router.push('/dashboard/fab-tex/purchase/purchase-return')
        } else {
            toast.error(result.error)
        }
    }

    const totalAmount = items.reduce((sum, it) => sum + (it.amount || 0), 0)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="shadow-lg border-none bg-background/50 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/10 border-b">
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Undo2 className="w-6 h-6 text-red-500" />
                        New Purchase Return
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label className="font-semibold">Against Invoice (Optional)</Label>
                            <Select onValueChange={onInvoiceChange} value={selectedInvoice?.id}>
                                <SelectTrigger className="border-red-100 hover:border-red-300 transition-colors">
                                    <SelectValue placeholder="Select Invoice..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Direct Return (No Invoice)</SelectItem>
                                    {invoices.map(inv => (
                                        <SelectItem key={inv.id} value={inv.id}>
                                            {inv.invoiceNumber} - {inv.account?.name || 'Walk-in'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Return Number</Label>
                            <Input value={returnNumber} onChange={e => setReturnNumber(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold">Vendor / Account</Label>
                            <Select
                                onValueChange={setSelectedVendorId}
                                value={selectedVendorId}
                                disabled={!!selectedInvoice}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                            {acc.name} ({acc.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            Return Items
                            <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100">{items.length}</Badge>
                        </h3>

                        <div className="rounded-xl border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[300px]">Item Details</TableHead>
                                        <TableHead className="w-[120px]">Inv Qty</TableHead>
                                        <TableHead className="w-[120px]">Return Qty</TableHead>
                                        <TableHead className="w-[120px]">Rate</TableHead>
                                        <TableHead className="w-[150px] text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                                Select an invoice to load returnable items.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <div className="font-bold text-red-700">{item.itemName}</div>
                                                    <div className="flex gap-2 text-[10px] uppercase text-muted-foreground font-semibold mt-1">
                                                        <span>{colors.find(c => c.id === item.colorId)?.name}</span>
                                                        <span>/</span>
                                                        <span>{brands.find(b => b.id === item.brandId)?.name}</span>
                                                        <span>/</span>
                                                        <span>{itemGrades.find(g => g.id === item.itemGradeId)?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-muted-foreground">
                                                        {item.invoicedQty} {item.unitSymbol}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.returnedQty || ''}
                                                        placeholder="0.00"
                                                        max={item.invoicedQty}
                                                        onChange={e => updateItem(idx, { returnedQty: parseFloat(e.target.value) || 0 })}
                                                        className="border-red-100 focus-visible:ring-red-500"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.rate || ''}
                                                        onChange={e => updateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-black text-lg text-red-600">
                                                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">Remarks</Label>
                        <Textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Reason for return, quality issues, etc..."
                            className="min-h-[100px] border-red-50 focus-visible:ring-red-200"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center bg-muted/20 p-6 border-t">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-red-500/70">Total Return Value</span>
                        <div className="text-3xl font-black text-red-600">
                            PKR {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalAmount)}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full px-8">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-full px-10 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200">
                            {loading ? 'Processing...' : 'Post Return'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    )
}
