import { Suspense } from "react"
import { getStockSummary } from "@/app/actions/fabtex/stock"
import { getWarehouses } from "@/app/actions/warehouses"
import { StockReportClient } from "@/components/fabtex/reports/stock-report-client"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

async function StockReportContent() {
    const [stockData, warehouses] = await Promise.all([
        getStockSummary('YARN'),
        getWarehouses('YARN') // Assuming we only want to filter by YARN warehouses, or general? Let's show all relevant.
        // Actually, users might want to see stock in ANY warehouse, but usually warehouses are also segmented.
        // Let's pass 'YARN' if we want strictly yarn warehouses, or no arg for all.
        // Given earlier tasks, we segmented warehouses. Let's use 'YARN' warehouses for the filter list.
    ])

    return <StockReportClient initialData={stockData} warehouses={warehouses} />
}

export default function StockReportPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <StockReportContent />
            </Suspense>
        </div>
    )
}
