'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export type ReturnState = {
    success: boolean
    message?: string
    error?: string
}

export async function getPurchaseInvoicesForReturn() {
    const invoices = await prisma.purchaseInvoice.findMany({
        include: {
            account: true,
            purchaseOrder: true,
            items: {
                include: {
                    itemMaster: { include: { packingUnit: true } },
                    unit: true,
                    color: true,
                    brand: true,
                    itemGrade: true,
                    returnItems: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Filter invoices that have remaining quantity to be returned
    // Return only those where at least one item has invoicedQty > totalReturned
    return invoices.filter(invoice => {
        return (invoice.items || []).some(item => {
            const totalReturned = (item.returnItems || []).reduce((sum, retItem) => sum + (retItem.returnedQty || 0), 0)
            return (item.invoicedQty || 0) > totalReturned
        })
    })
}

export async function createPurchaseReturn(prevState: ReturnState, formData: FormData): Promise<ReturnState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const invoiceId = formData.get('purchaseInvoiceId') as string
        const returnNumber = formData.get('returnNumber') as string
        const date = formData.get('date') as string
        const remarks = formData.get('remarks') as string
        const accountId = formData.get('accountId') as string
        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!items || items.length === 0) {
            return { success: false, error: 'No items to return' }
        }

        const totalAmount = items.reduce((sum: number, it: any) => sum + (parseFloat(it.amount) || 0), 0)

        await prisma.purchaseReturn.create({
            data: {
                returnNumber,
                date: new Date(date),
                remarks,
                purchaseInvoiceId: invoiceId || null,
                accountId: accountId ? parseInt(accountId) : null,
                totalAmount,
                companyId: company.id,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    create: items.map((item: any) => ({
                        itemMasterId: item.itemMasterId,
                        purchaseInvoiceItemId: item.purchaseInvoiceItemId || null,
                        grnItemId: item.grnItemId || null,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        unitId: item.unitId ? parseInt(item.unitId) : null,
                        returnedQty: parseFloat(item.returnedQty),
                        rate: parseFloat(item.rate),
                        amount: parseFloat(item.amount)
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/purchase/purchase-return')
        return { success: true, message: 'Purchase Return created successfully' }
    } catch (error: any) {
        console.error('RETURN_CREATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to create return' }
    }
}

export async function getPurchaseReturns(segment?: string) {
    const company = await prisma.company.findFirst()
    if (!company) return []

    return await prisma.purchaseReturn.findMany({
        where: {
            companyId: company.id,
            ...(segment && { segment: segment as any })
        },
        include: {
            account: true,
            purchaseInvoice: true,
            items: {
                include: { itemMaster: { include: { packingUnit: true } } }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getPurchaseReturnById(id: string) {
    return await prisma.purchaseReturn.findUnique({
        where: { id },
        include: {
            account: true,
            purchaseInvoice: {
                include: { purchaseOrder: true }
            },
            items: {
                include: {
                    itemMaster: { include: { packingUnit: true } },
                    unit: true,
                    color: true,
                    brand: true,
                    itemGrade: true
                }
            },
            company: true
        }
    })
}

export async function deletePurchaseReturn(id: string): Promise<ReturnState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.purchaseReturn.delete({
            where: { id }
        })

        revalidatePath('/dashboard/fab-tex/purchase/purchase-return')
        return { success: true, message: 'Purchase Return deleted successfully' }
    } catch (error: any) {
        console.error('RETURN_DELETE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to delete return' }
    }
}
