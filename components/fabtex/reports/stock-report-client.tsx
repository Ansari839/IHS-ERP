"use client"

import { useState, useEffect } from "react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getStockSummary, StockSummaryItem } from "@/app/actions/fabtex/stock"
import { Search, Filter, Download } from "lucide-react"

interface StockReportClientProps {
    initialData: StockSummaryItem[]
    warehouses: any[]
}

export function StockReportClient({ initialData, warehouses }: StockReportClientProps) {
    const [data, setData] = useState<StockSummaryItem[]>(initialData)
    const [warehouseId, setWarehouseId] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)

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

    const filteredData = data.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalStock = filteredData.reduce((acc, item) => acc + item.currentStock, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Yarn Stock Ledger</h2>
                    <p className="text-muted-foreground">Real-time inventory levels for Yarn segment.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredData.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Quantity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={warehouseId} onValueChange={handleWarehouseChange}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Filter by Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>
                                {w.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Code</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Received</TableHead>
                            <TableHead className="text-right">Returned</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="w-[100px]">Unit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No stock items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.itemMasterId}>
                                    <TableCell className="font-mono">{item.itemCode}</TableCell>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/dashboard/fab-tex/reports/stock/${item.itemMasterId}`}
                                            className="hover:underline text-blue-600"
                                        >
                                            {item.itemName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{item.categoryName}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{item.totalReceived}</TableCell>
                                    <TableCell className="text-right text-red-500">
                                        {item.totalReturned > 0 ? `-${item.totalReturned}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {item.currentStock}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                                            {item.unitName}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
