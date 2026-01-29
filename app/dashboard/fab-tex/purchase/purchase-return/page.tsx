'use server'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReturnList } from '@/components/fabtex/purchase-return/return-list'
import { getPurchaseReturns } from '@/app/actions/fabtex/purchase-return'

export default async function PurchaseReturnPage() {
    const returns = await getPurchaseReturns('YARN')

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Return</h2>
                <Link href="/dashboard/fab-tex/purchase/purchase-return/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Return
                    </Button>
                </Link>
            </div>

            <ReturnList initialData={returns} />
        </div>
    )
}
