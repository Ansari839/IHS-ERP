'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function getInvoiceFormData() {
    const [{ sos: salesOrders, allEligibleDOs }, accounts, itemMasters, units, colors, brands, itemGrades, packingUnits, warehouses] = await Promise.all([
        getEligibleForInvoicing(),
        prisma.account.findMany({
            where: { isPosting: true },
            orderBy: { name: 'asc' }
        }),
        prisma.itemMaster.findMany({
            include: { baseUnit: true, packingUnit: true },
            orderBy: { name: 'asc' }
        }),
        prisma.unit.findMany({ orderBy: { symbol: 'asc' } }),
        prisma.color.findMany({ orderBy: { name: 'asc' } }),
        prisma.brand.findMany({ orderBy: { name: 'asc' } }),
        prisma.itemGrade.findMany({ orderBy: { name: 'asc' } }),
        prisma.packingUnit.findMany({ orderBy: { name: 'asc' } }),
        prisma.warehouse.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } })
    ])

    return {
        salesOrders,
        accounts,
        itemMasters,
        units,
        colors,
        brands,
        itemGrades,
        packingUnits,
        allEligibleDOs,
        warehouses
    }
}

export type InvoiceState = {
    success: boolean
    message?: string
    error?: string
}

export async function getEligibleForInvoicing() {
    // 1. Fetch SO-linked DOs (current logic preserved)
    const sos = await prisma.salesOrder.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING', 'COMPLETED', 'DRAFT'] }
        },
        include: {
            account: true,
            deliveryOrders: {
                include: {
                    items: {
                        include: {
                            itemMaster: true,
                            unit: true,
                            color: true,
                            brand: true,
                            itemGrade: true,
                            packingUnit: true,
                            invoiceItems: true
                        }
                    }
                }
            },
            items: {
                include: {
                    itemMaster: true,
                    deliveryOrderItems: true,
                    invoiceItems: true,
                    unit: true,
                    color: true,
                    brand: true,
                    itemGrade: true,
                    packingUnit: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // 2. Fetch Direct DOs (No SO link)
    const directDos = await prisma.deliveryOrder.findMany({
        where: {
            salesOrderId: null,
            accountId: { not: null }
        },
        include: {
            account: true,
            items: {
                include: {
                    itemMaster: true,
                    unit: true,
                    color: true,
                    brand: true,
                    itemGrade: true,
                    packingUnit: true,
                    invoiceItems: true
                }
            }
        }
    })

    const allEligibleFromSos = sos.flatMap(so =>
        (so.deliveryOrders || []).map(doItem => ({
            ...doItem,
            soNumber: so.soNumber,
            customerName: so.account?.name || so.partyName,
            isFullyInvoiced: !(doItem.items || []).some((item: any) => {
                const totalInvoiced = (item.invoiceItems || []).reduce((sum: number, invItem: any) => sum + (invItem.invoicedQty || 0), 0)
                return (item.deliveredQty || 0) > totalInvoiced
            })
        }))
    ).filter(doItem => !doItem.isFullyInvoiced)

    const allEligibleDirect = directDos.map(doItem => ({
        ...doItem,
        soNumber: 'DIRECT',
        customerName: doItem.account?.name || 'Unknown',
        isFullyInvoiced: !(doItem.items || []).some((item: any) => {
            const totalInvoiced = (item.invoiceItems || []).reduce((sum: number, invItem: any) => sum + (invItem.invoicedQty || 0), 0)
            return (item.deliveredQty || 0) > totalInvoiced
        })
    })).filter(doItem => !doItem.isFullyInvoiced)

    const allEligibleDOs = [...allEligibleFromSos, ...allEligibleDirect]

    // Special: Filter filteredSos to only include those that have at least one eligible DO
    const filteredSos = sos.filter(so =>
        allEligibleFromSos.some(edo => edo.salesOrderId === so.id)
    )

    return { sos: filteredSos, allEligibleDOs }
}

export async function createSalesInvoice(prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const salesOrderId = formData.get('salesOrderId') as string || null
        const accountId = formData.get('accountId') ? parseInt(formData.get('accountId') as string) : null

        const invoiceNumber = formData.get('invoiceNumber') as string
        const date = formData.get('date') as string
        const status = formData.get('status') as string || 'UNPAID'
        const warehouseId = formData.get('warehouseId') ? parseInt(formData.get('warehouseId') as string, 10) : null
        const warehouseRefNo = formData.get('warehouseRefNo') as string
        const remarks = formData.get('remarks') as string

        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!items || items.length === 0) {
            return { success: false, error: 'No items in invoice' }
        }

        const totalAmount = items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0)

        // TODO: Implement Journal Entry creation here if required (Debit Customer, Credit Sales)

        await prisma.salesInvoice.create({
            data: {
                invoiceNumber,
                date: new Date(date),
                salesOrderId: salesOrderId || undefined,
                accountId,
                warehouseId,
                warehouseRefNo: warehouseRefNo || null,
                remarks,
                totalAmount,
                status,
                companyId: company.id,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    create: items.map((item: any) => ({
                        salesOrderItemId: item.salesOrderItemId || null,
                        deliveryOrderItemId: item.deliveryOrderItemId || null,
                        itemMasterId: item.itemMasterId || null,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        unitId: item.unitId ? parseInt(item.unitId) : null,
                        invoicedQty: parseFloat(item.invoicedQty),
                        rate: parseFloat(item.rate),
                        amount: parseFloat(item.amount),
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        packingType: item.packingType || null
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/sales/invoice')
        return { success: true, message: 'Sales Invoice created successfully' }
    } catch (error: any) {
        console.error('INVOICE_CREATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to create Invoice' }
    }
}

export async function updateSalesInvoice(invoiceId: string, prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const salesOrderId = formData.get('salesOrderId') as string || null
        const accountId = formData.get('accountId') ? parseInt(formData.get('accountId') as string) : null

        const invoiceNumber = formData.get('invoiceNumber') as string
        const date = formData.get('date') as string
        const status = formData.get('status') as string || 'UNPAID'
        const warehouseId = formData.get('warehouseId') ? parseInt(formData.get('warehouseId') as string, 10) : null
        const warehouseRefNo = formData.get('warehouseRefNo') as string
        const remarks = formData.get('remarks') as string

        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!invoiceId || !items || items.length === 0) {
            return { success: false, error: 'Invalid Invoice data' }
        }

        const totalAmount = items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0)

        await prisma.salesInvoice.update({
            where: { id: invoiceId },
            data: {
                invoiceNumber,
                date: new Date(date),
                salesOrderId: salesOrderId || null,
                accountId,
                warehouseId,
                warehouseRefNo: warehouseRefNo || null,
                remarks,
                totalAmount,
                status,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    deleteMany: {},
                    create: items.map((item: any) => ({
                        salesOrderItemId: item.salesOrderItemId || null,
                        deliveryOrderItemId: item.deliveryOrderItemId || null,
                        itemMasterId: item.itemMasterId || null,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        unitId: item.unitId ? parseInt(item.unitId) : null,
                        invoicedQty: parseFloat(item.invoicedQty),
                        rate: parseFloat(item.rate),
                        amount: parseFloat(item.amount),
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        packingType: item.packingType || null
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/sales/invoice')
        return { success: true, message: 'Sales Invoice updated successfully' }
    } catch (error: any) {
        console.error('INVOICE_UPDATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to update Invoice' }
    }
}

export async function deleteSalesInvoice(id: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.salesInvoice.delete({
            where: { id }
        })

        revalidatePath('/dashboard/fab-tex/sales/invoice')
        return { success: true, message: 'Invoice deleted successfully' }
    } catch (error: any) {
        console.error('INVOICE_DELETE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to delete Invoice' }
    }
}

export async function getSalesInvoices(segment?: string) {
    const company = await prisma.company.findFirst()
    if (!company) return []

    return await prisma.salesInvoice.findMany({
        where: {
            companyId: company.id,
            ...(segment && { segment: segment as any })
        },
        include: {
            salesOrder: {
                include: { account: true }
            },
            account: true,
            items: {
                include: {
                    salesOrderItem: {
                        include: {
                            itemMaster: { include: { packingUnit: true } },
                            packingUnit: true
                        }
                    },
                    itemMaster: { include: { packingUnit: true } }
                }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getSalesInvoiceById(id: string) {
    return await prisma.salesInvoice.findUnique({
        where: { id },
        include: {
            salesOrder: {
                include: {
                    account: true,
                    items: true,
                    deliveryOrders: true
                }
            },
            account: true,
            company: true,
            warehouse: true,
            items: {
                include: {
                    salesOrderItem: {
                        include: {
                            itemMaster: { include: { packingUnit: true } },
                            unit: true,
                            color: true,
                            brand: true,
                            itemGrade: true,
                            packingUnit: true
                        }
                    },
                    deliveryOrderItem: true,
                    itemMaster: { include: { packingUnit: true } },
                    unit: true,
                    color: true,
                    brand: true,
                    itemGrade: true
                }
            }
        }
    })
}
