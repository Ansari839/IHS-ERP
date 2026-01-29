'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Prisma, SalesOrderType, SalesOrderStatus, PackingType } from '@/app/generated/prisma/client'

export type SOState = {
    success?: boolean
    error?: string
    data?: any
}

// Helper to generate SO Number
async function generateSONumber(companyId: number): Promise<string> {
    const lastSO = await prisma.salesOrder.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
    })

    let nextNumber = 1
    if (lastSO && lastSO.soNumber) {
        // format SO-0001
        const parts = lastSO.soNumber.split('-')
        if (parts.length === 2) {
            const num = parseInt(parts[1], 10)
            if (!isNaN(num)) nextNumber = num + 1
        }
    }
    return `SO-${String(nextNumber).padStart(4, '0')}`
}

export async function createSalesOrder(prevState: SOState, formData: FormData): Promise<SOState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        // Basic Fields
        const type = formData.get('type') as SalesOrderType
        const dateStr = formData.get('date') as string
        const accountIdStr = formData.get('accountId') as string
        const warehouseIdStr = formData.get('warehouseId') as string
        const partyName = formData.get('partyName') as string
        const remarks = formData.get('remarks') as string

        // Conditional Fields
        const referenceNo = formData.get('referenceNo') as string
        const fileNo = formData.get('fileNo') as string
        const documentDateStr = formData.get('documentDate') as string

        // Items JSON
        const itemsJson = formData.get('items') as string
        if (!itemsJson) return { success: false, error: 'No items provided' }

        const items = JSON.parse(itemsJson)

        if (!type || !dateStr || items.length === 0) {
            return { success: false, error: 'Missing required fields' }
        }

        const soNumber = await generateSONumber(company.id)

        // Calculate total (simple sum of item amounts)
        const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)

        const transaction = await prisma.$transaction(async (tx) => {
            const so = await tx.salesOrder.create({
                data: {
                    soNumber,
                    type,
                    date: new Date(dateStr),
                    status: SalesOrderStatus.DRAFT,
                    accountId: (accountIdStr && accountIdStr !== 'null' && accountIdStr !== 'undefined' && accountIdStr !== '') ? parseInt(accountIdStr, 10) : null,
                    partyName: partyName || undefined,
                    warehouseId: (warehouseIdStr && warehouseIdStr !== 'null' && warehouseIdStr !== 'undefined' && warehouseIdStr !== '') ? parseInt(warehouseIdStr, 10) : null,
                    referenceNo: referenceNo || null,
                    fileNo: fileNo || null,
                    documentDate: documentDateStr ? new Date(documentDateStr) : null,
                    remarks: remarks || null,
                    totalAmount,
                    companyId: company.id,
                    segment: (formData.get('segment') as any) || 'GENERAL',

                    items: {
                        create: items.map((item: any) => ({
                            itemMasterId: item.itemMasterId,
                            colorId: item.colorId || null,
                            brandId: item.brandId || null,
                            itemGradeId: item.itemGradeId || null,
                            quantity: (item.quantity !== undefined && item.quantity !== '') ? parseFloat(item.quantity) : null,
                            rate: item.rate ? parseFloat(item.rate) : 0,
                            amount: item.amount ? parseFloat(item.amount) : 0,
                            unitId: item.unitId ? parseInt(item.unitId, 10) : null,
                            packingType: item.packingType || null,
                            packingUnitId: (item.packingUnitId && item.packingUnitId !== 'none') ? item.packingUnitId : null,
                            pcs: item.pcs ? parseFloat(item.pcs) : null,
                            unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                            remarks: item.remarks || null
                        }))
                    }
                }
            })
            return so
        })

        revalidatePath('/dashboard/fab-tex/sales/sales-order')
        return { success: true, data: transaction }

    } catch (error: any) {
        console.error('Create SO Error:', error)
        return { success: false, error: error.message || 'Failed to create Sales Order' }
    }
}

export async function updateSalesOrder(id: string, prevState: SOState, formData: FormData): Promise<SOState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        // Similar parsing as Create...
        const type = formData.get('type') as SalesOrderType
        const dateStr = formData.get('date') as string
        const accountIdStr = formData.get('accountId') as string
        const warehouseIdStr = formData.get('warehouseId') as string
        const partyName = formData.get('partyName') as string
        const remarks = formData.get('remarks') as string
        const referenceNo = formData.get('referenceNo') as string
        const fileNo = formData.get('fileNo') as string
        const documentDateStr = formData.get('documentDate') as string
        const itemsJson = formData.get('items') as string
        if (!itemsJson) return { success: false, error: 'No items provided' }
        const items = JSON.parse(itemsJson)

        if (!type || !dateStr || items.length === 0) {
            return { success: false, error: 'Missing required fields' }
        }

        const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)

        const startTime = Date.now()
        // Use a single nested update to avoid interactive transaction overhead
        await prisma.salesOrder.update({
            where: { id },
            data: {
                type,
                date: new Date(dateStr),
                accountId: (accountIdStr && accountIdStr !== 'null' && accountIdStr !== 'undefined' && accountIdStr !== '') ? parseInt(accountIdStr, 10) : null,
                partyName: partyName || null,
                warehouseId: (warehouseIdStr && warehouseIdStr !== 'null' && warehouseIdStr !== 'undefined' && warehouseIdStr !== '') ? parseInt(warehouseIdStr, 10) : null,
                referenceNo: referenceNo || null,
                fileNo: fileNo || null,
                documentDate: documentDateStr ? new Date(documentDateStr) : null,
                remarks: remarks || null,
                totalAmount,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    deleteMany: {}, // Delete all existing items. Note: This clears DO links if any exist! Need to be careful once DO is implemented.
                    create: items.map((item: any) => ({
                        itemMasterId: item.itemMasterId,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        quantity: (item.quantity !== undefined && item.quantity !== '') ? parseFloat(item.quantity) : null,
                        rate: item.rate ? parseFloat(item.rate) : 0,
                        amount: item.amount ? parseFloat(item.amount) : 0,
                        unitId: item.unitId ? parseInt(item.unitId, 10) : null,
                        packingType: item.packingType || null,
                        packingUnitId: (item.packingUnitId && item.packingUnitId !== 'none') ? item.packingUnitId : null,
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        remarks: item.remarks || null
                    }))
                }
            }
        })
        console.log(`SO Update completed in ${Date.now() - startTime}ms`)

        revalidatePath('/dashboard/fab-tex/sales/sales-order')
        return { success: true }

    } catch (error: any) {
        console.error('Update SO Error:', error)
        // Return a more descriptive error if possible
        if (error.code === 'P2003') {
            return { success: false, error: 'Cannot update SO items: Some items are already linked to other documents.' }
        }
        return { success: false, error: error.message || 'Failed to update Sales Order' }
    }
}

export async function deleteSalesOrder(id: string): Promise<SOState> {
    try {
        await prisma.salesOrder.delete({ where: { id } })
        revalidatePath('/dashboard/fab-tex/sales/sales-order')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete Sales Order' }
    }
}

// Fetchers
export async function getSalesOrders(segment?: string) {
    try {
        const company = await prisma.company.findFirst()
        if (!company) return []

        return await prisma.salesOrder.findMany({
            where: {
                companyId: company.id,
                ...(segment && { segment: segment as any })
            },
            include: {
                account: true,
                warehouse: true,
                items: {
                    include: {
                        deliveryOrderItems: true,
                        invoiceItems: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error('getSalesOrders Error:', error)
        return []
    }
}

export async function getSalesOrderById(id: string) {
    console.log('getSalesOrderById: id =', id)
    return await prisma.salesOrder.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    itemMaster: { include: { packingUnit: true } },
                    color: true,
                    brand: true,
                    unit: true,
                    packingUnit: true,
                    deliveryOrderItems: true,
                    invoiceItems: true,
                }
            },
            account: true,
            warehouse: true,
            company: true
        }
    })
}
