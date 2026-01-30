
import { getItemLedger } from "@/app/actions/fabtex/stock"
import prisma from "@/lib/prisma"
import { ItemLedgerClient } from "@/components/fabtex/reports/item-ledger-client"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ itemId: string }>
    searchParams: Promise<{ colorId?: string }>
}

export default async function ItemLedgerPage({ params, searchParams }: PageProps) {
    const { itemId } = await params
    const { colorId } = await searchParams

    const item = await prisma.itemMaster.findUnique({
        where: { id: itemId }
    })

    if (!item) {
        notFound()
    }

    const ledgerEntries = await getItemLedger(itemId, 'YARN', colorId)

    // Optional: Fetch color name if colorId is present to show in title
    let filterDescription = ''
    if (colorId) {
        const color = await prisma.color.findUnique({ where: { id: colorId } })
        if (color) filterDescription = ` - ${color.name}`
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ItemLedgerClient
                entries={ledgerEntries}
                itemName={`${item.name}${filterDescription}`}
                itemCode={item.code}
            />
        </div>
    )
}
