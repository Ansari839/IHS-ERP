
import { getItemLedger } from "@/app/actions/fabtex/stock"
import prisma from "@/lib/prisma"
import { ItemLedgerClient } from "@/components/fabtex/reports/item-ledger-client"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ itemId: string }>
}

export default async function ItemLedgerPage({ params }: PageProps) {
    const { itemId } = await params

    const item = await prisma.itemMaster.findUnique({
        where: { id: itemId }
    })

    if (!item) {
        notFound()
    }

    const ledgerEntries = await getItemLedger(itemId, 'YARN')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ItemLedgerClient
                entries={ledgerEntries}
                itemName={item.name}
                itemCode={item.code}
            />
        </div>
    )
}
