"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStockSummary, StockSummaryItem } from "@/app/actions/fabtex/stock"
import { Search, Filter, Download, ChevronRight, ChevronDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface StockReportClientProps {
    initialData: StockSummaryItem[]
    warehouses: any[]
}

export function StockReportClient({ initialData, warehouses }: StockReportClientProps) {
    const router = useRouter()
    const [data, setData] = useState<StockSummaryItem[]>(initialData)
    const [warehouseId, setWarehouseId] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const fetchStock = async (wId: string) => {
        setLoading(true)
        try {
            const result = await getStockSummary('YARN', wId === 'all' ? undefined : wId)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch stock:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleWarehouseChange = (value: string) => {
        setWarehouseId(value)
        fetchStock(value)
    }

    const toggleRow = (id: string) => {
        const next = new Set(expandedRows)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setExpandedRows(next)
    }

    const filteredData = data.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Grouping: Item -> Warehouse -> Rows
    const groupedData: Record<string, StockSummaryItem[]> = {}
    filteredData.forEach(item => {
        const groupKey = `${item.itemMasterId}-${item.warehouseId}`
        if (!groupedData[groupKey]) groupedData[groupKey] = []
        groupedData[groupKey].push(item)
    })

    const summaryRows = Object.entries(groupedData).map(([key, items]) => {
        const first = items[0]
        const totalStock = items.reduce((acc, curr) => acc + curr.currentStock, 0)
        return {
            key,
            itemMasterId: first.itemMasterId,
            itemCode: first.itemCode,
            itemName: first.itemName,
            warehouseName: first.warehouseName,
            warehouseRefNo: Array.from(new Set(items.map(i => i.warehouseRefNo).filter(Boolean))).join(', '),
            fileNo: Array.from(new Set(items.map(i => i.fileNo).filter(Boolean))).join(', '),
            totalStock,
            items // Children
        }
    })

    const grandTotal = filteredData.reduce((acc, item) => acc + item.currentStock, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Yarn Stock Report</h2>
                    <p className="text-muted-foreground text-sm">Hierarchical view of inventory with color and packing details.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="py-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-2xl font-bold">{grandTotal.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Total Stock in KG</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-semibold">{summaryRows.length}</div>
                                <div className="text-xs text-muted-foreground">Unique Batches</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={warehouseId} onValueChange={handleWarehouseChange}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Filter Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>WH-Ref / File No</TableHead>
                            <TableHead className="text-right">Total Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Loading inventory data...</TableCell></TableRow>
                        ) : summaryRows.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No stock items found.</TableCell></TableRow>
                        ) : summaryRows.map((row) => (
                            <>
                                <TableRow
                                    key={row.key}
                                    className={cn("cursor-pointer hover:bg-muted/30 transition-colors", expandedRows.has(row.key) && "bg-muted/20 border-l-4 border-l-primary")}
                                    onClick={() => toggleRow(row.key)}
                                >
                                    <TableCell>
                                        {expandedRows.has(row.key) ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4" />}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{row.itemName}</div>
                                        <div className="text-[10px] font-mono text-muted-foreground uppercase">{row.itemCode}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">{row.warehouseName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm truncate max-w-[200px]" title={row.warehouseRefNo}>
                                            {row.warehouseRefNo || '-'}
                                        </div>
                                        {row.fileNo && <div className="text-[10px] text-primary bg-primary/10 px-1 inline-block rounded">File: {row.fileNo}</div>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-bold text-lg">{row.totalStock.toLocaleString()}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">KGS</div>
                                    </TableCell>
                                </TableRow>
                                {expandedRows.has(row.key) && (
                                    <TableRow className="bg-muted/5 hover:bg-muted/5">
                                        <TableCell></TableCell>
                                        <TableCell colSpan={4} className="p-0">
                                            <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="text-xs font-bold uppercase text-muted-foreground border-b pb-1 flex justify-between">
                                                    <span>Color & Packing Details</span>
                                                    <span>Click Color for Ledger</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {row.items.map((sub, i) => (
                                                        <Card key={i} className="shadow-none border border-border/50 hover:border-primary/50 transition-colors bg-white">
                                                            <CardContent className="p-3">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div
                                                                        className="font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.push(`/dashboard/fab-tex/reports/stock/${sub.itemMasterId}?colorId=${sub.colorId || ''}`)
                                                                        }}
                                                                    >
                                                                        {sub.colorName}
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold">{sub.currentStock}</div>
                                                                        <div className="text-[10px] text-muted-foreground uppercase">KG</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {sub.brandName !== '-' && <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[9px] font-bold">{sub.brandName}</Badge>}
                                                                    {sub.gradeName !== '-' && <Badge variant="outline" className="px-1.5 py-0 h-4 text-[9px] font-bold">{sub.gradeName}</Badge>}
                                                                    <Badge className={cn("px-1.5 py-0 h-4 text-[9px] font-bold", sub.packingType === 'EVEN' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                                                                        {sub.packingType}
                                                                    </Badge>
                                                                </div>
                                                                {sub.packingType === 'EVEN' && (
                                                                    <div className="text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 mt-2 flex justify-between items-center">
                                                                        <span className="text-muted-foreground">Packing:</span>
                                                                        <span>{sub.pcs} {sub.packingUnitSymbol} <span className="text-muted-foreground mx-1">x</span> {sub.unitSize} KG</span>
                                                                    </div>
                                                                )}
                                                                {sub.lotNo && (
                                                                    <div className="text-[9px] mt-1 text-muted-foreground italic">Lot: {sub.lotNo}</div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
