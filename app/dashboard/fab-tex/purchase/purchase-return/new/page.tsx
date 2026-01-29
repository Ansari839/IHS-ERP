'use server'

import prisma from '@/lib/prisma'
import { ReturnForm } from '@/components/fabtex/purchase-return/return-form'
import { getPurchaseInvoicesForReturn } from '@/app/actions/fabtex/purchase-return'

export default async function NewReturnPage() {
    const [invoices, accounts, itemMasters, units, colors, brands, itemGrades] = await Promise.all([
        getPurchaseInvoicesForReturn(),
        prisma.account.findMany({ where: { isPosting: true }, orderBy: { name: 'asc' } }),
        prisma.itemMaster.findMany({ orderBy: { name: 'asc' } }),
        prisma.unit.findMany(),
        prisma.color.findMany(),
        prisma.brand.findMany(),
        prisma.itemGrade.findMany(),
    ])

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <ReturnForm
                invoices={invoices}
                accounts={accounts}
                itemMasters={itemMasters}
                units={units}
                colors={colors}
                brands={brands}
                itemGrades={itemGrades}
            />
        </div>
    )
}
