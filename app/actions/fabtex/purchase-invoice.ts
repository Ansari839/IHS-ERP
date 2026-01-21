'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export type InvoiceState = {
    success: boolean
    message?: string
    error?: string
}

export async function getEligibleForInvoicing() {
    // Fetch POs that have items not fully invoiced
    // This is a bit complex for a single query, so we'll fetch POs and their items
    return await prisma.purchaseOrder.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING', 'COMPLETED'] }
        },
        include: {
            account: true,
            items: {
                include: {
                    itemMaster: true,
                    grnItems: true,
                    invoiceItems: true,
                    unit: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createPurchaseInvoice(prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const poId = formData.get('purchaseOrderId') as string
        const invoiceNumber = formData.get('invoiceNumber') as string
        const date = formData.get('date') as string
        const status = formData.get('status') as string || 'UNPAID'
        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!poId || !items || items.length === 0) {
            return { success: false, error: 'Invalid Invoice data' }
        }

        const totalAmount = items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0)

        await prisma.purchaseInvoice.create({
            data: {
                invoiceNumber,
                date: new Date(date),
                purchaseOrderId: poId,
                totalAmount,
                status,
                companyId: company.id,
                items: {
                    create: items.map((item: any) => ({
                        purchaseOrderItemId: item.purchaseOrderItemId,
                        grnItemId: item.grnItemId || null,
                        invoicedQty: parseFloat(item.invoicedQty),
                        rate: parseFloat(item.rate),
                        amount: parseFloat(item.amount)
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/purchase/invoice')
        return { success: true, message: 'Purchase Invoice created successfully' }
    } catch (error: any) {
        console.error('INVOICE_CREATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to create Invoice' }
    }
}

export async function getPurchaseInvoices() {
    return await prisma.purchaseInvoice.findMany({
        include: {
            purchaseOrder: {
                include: { account: true }
            },
            items: {
                include: {
                    purchaseOrderItem: {
                        include: { itemMaster: true }
                    }
                }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getPurchaseInvoiceById(id: string) {
    return await prisma.purchaseInvoice.findUnique({
        where: { id },
        include: {
            purchaseOrder: {
                include: { account: true }
            },
            items: {
                include: {
                    purchaseOrderItem: {
                        include: {
                            itemMaster: true,
                            unit: true,
                            color: true,
                            brand: true,
                            itemGrade: true
                        }
                    },
                    grnItem: true
                }
            }
        }
    })
}
