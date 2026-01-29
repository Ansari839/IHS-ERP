
import { AccountService } from "@/lib/services/account-service"
import { VendorLedgerClient } from "@/components/fabtex/account/vendor-ledger-client"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ vendorId: string }>
}

export default async function VendorLedgerPage({ params }: PageProps) {
    const { vendorId } = await params
    const id = parseInt(vendorId)

    if (isNaN(id)) notFound()

    const result = await AccountService.getAccountLedger(id)

    if (!result) {
        notFound()
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <VendorLedgerClient
                account={result.account}
                lines={result.lines}
            />
        </div>
    )
}
