'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export type ReturnState = {
    success: boolean
    message?: string
    error?: string
}

export async function getSalesInvoicesForReturn() {
    const invoices = await prisma.salesInvoice.findMany({
        include: {
            account: true,
            salesOrder: true,
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
    return invoices.filter(invoice => {
        return (invoice.items || []).some(item => {
            const totalReturned = (item.returnItems || []).reduce((sum, retItem) => sum + (retItem.returnedQty || 0), 0)
            return (item.invoicedQty || 0) > totalReturned
        })
    })
}

export async function getReturnFormData() {
    const [invoices, accounts, itemMasters, units, colors, brands, itemGrades] = await Promise.all([
        getSalesInvoicesForReturn(),
        prisma.account.findMany({ where: { isPosting: true }, orderBy: { name: 'asc' } }),
        prisma.itemMaster.findMany({ include: { baseUnit: true, packingUnit: true }, orderBy: { name: 'asc' } }),
        prisma.unit.findMany({ orderBy: { symbol: 'asc' } }),
        prisma.color.findMany({ orderBy: { name: 'asc' } }),
        prisma.brand.findMany({ orderBy: { name: 'asc' } }),
        prisma.itemGrade.findMany({ orderBy: { name: 'asc' } })
    ])

    return {
        invoices,
        accounts,
        itemMasters,
        units,
        colors,
        brands,
        itemGrades
    }
}

export async function createSalesReturn(prevState: ReturnState, formData: FormData): Promise<ReturnState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const invoiceId = formData.get('salesInvoiceId') as string
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

        await prisma.salesReturn.create({
            data: {
                returnNumber,
                date: new Date(date),
                remarks,
                salesInvoiceId: invoiceId || null,
                accountId: accountId ? parseInt(accountId) : null,
                totalAmount,
                companyId: company.id,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    create: items.map((item: any) => ({
                        itemMasterId: item.itemMasterId,
                        salesInvoiceItemId: item.salesInvoiceItemId || null,
                        deliveryOrderItemId: item.deliveryOrderItemId || null,
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

        revalidatePath('/dashboard/fab-tex/sales/sales-return')
        return { success: true, message: 'Sales Return created successfully' }
    } catch (error: any) {
        console.error('RETURN_CREATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to create return' }
    }
}

export async function getSalesReturns(segment?: string) {
    const company = await prisma.company.findFirst()
    if (!company) return []

    return await prisma.salesReturn.findMany({
        where: {
            companyId: company.id,
            ...(segment && { segment: segment as any })
        },
        include: {
            account: true,
            salesInvoice: true,
            items: {
                include: { itemMaster: { include: { packingUnit: true } } }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getSalesReturnById(id: string) {
    return await prisma.salesReturn.findUnique({
        where: { id },
        include: {
            account: true,
            salesInvoice: {
                include: { salesOrder: true }
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

export async function updateSalesReturn(id: string, prevState: ReturnState, formData: FormData): Promise<ReturnState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const invoiceId = formData.get('salesInvoiceId') as string
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

        await prisma.salesReturn.update({
            where: { id },
            data: {
                returnNumber,
                date: new Date(date),
                remarks,
                salesInvoiceId: invoiceId === 'none' ? null : invoiceId,
                accountId: accountId ? parseInt(accountId) : null,
                totalAmount,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    deleteMany: {},
                    create: items.map((item: any) => ({
                        itemMasterId: item.itemMasterId,
                        salesInvoiceItemId: item.salesInvoiceItemId || null,
                        deliveryOrderItemId: item.deliveryOrderItemId || null,
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

        revalidatePath('/dashboard/fab-tex/sales/sales-return')
        return { success: true, message: 'Sales Return updated successfully' }
    } catch (error: any) {
        console.error('RETURN_UPDATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to update return' }
    }
}

export async function deleteSalesReturn(id: string): Promise<ReturnState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.salesReturn.delete({
            where: { id }
        })

        revalidatePath('/dashboard/fab-tex/sales/sales-return')
        return { success: true, message: 'Sales Return deleted successfully' }
    } catch (error: any) {
        console.error('RETURN_DELETE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to delete return' }
    }
}
