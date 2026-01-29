'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Prisma, PurchaseOrderType, PurchaseOrderStatus, PackingType } from '@/app/generated/prisma/client'

export type POState = {
    success?: boolean
    error?: string
    data?: any
}

// Helper to generate PO Number
async function generatePONumber(companyId: number): Promise<string> {
    const lastPO = await prisma.purchaseOrder.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' }
    })

    let nextNumber = 1
    if (lastPO && lastPO.poNumber) {
        // format PO-0001
        const parts = lastPO.poNumber.split('-')
        if (parts.length === 2) {
            const num = parseInt(parts[1], 10)
            if (!isNaN(num)) nextNumber = num + 1
        }
    }
    return `PO-${String(nextNumber).padStart(4, '0')}`
}

export async function createPurchaseOrder(prevState: POState, formData: FormData): Promise<POState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        // Basic Fields
        const type = formData.get('type') as PurchaseOrderType
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

        const poNumber = await generatePONumber(company.id)

        // Calculate total (simple sum of item amounts)
        const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)

        const transaction = await prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.create({
                data: {
                    poNumber,
                    type,
                    date: new Date(dateStr),
                    status: PurchaseOrderStatus.DRAFT,
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
            return po
        })

        revalidatePath('/dashboard/fab-tex/purchase/purchase-order')
        return { success: true, data: transaction }

    } catch (error: any) {
        console.error('Create PO Error:', error)
        return { success: false, error: error.message || 'Failed to create Purchase Order' }
    }
}

export async function updatePurchaseOrder(id: string, prevState: POState, formData: FormData): Promise<POState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        // Similar parsing as Create...
        const type = formData.get('type') as PurchaseOrderType
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
        await prisma.purchaseOrder.update({
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
                    deleteMany: {}, // Delete all existing items
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
        console.log(`PO Update completed in ${Date.now() - startTime}ms`)

        revalidatePath('/dashboard/fab-tex/purchase/purchase-order')
        return { success: true }

    } catch (error: any) {
        console.error('Update PO Error:', error)
        // Return a more descriptive error if possible
        if (error.code === 'P2003') {
            return { success: false, error: 'Cannot update PO items: Some items are already received in a GRN.' }
        }
        return { success: false, error: error.message || 'Failed to update Purchase Order' }
    }
}

export async function deletePurchaseOrder(id: string): Promise<POState> {
    try {
        await prisma.purchaseOrder.delete({ where: { id } })
        revalidatePath('/dashboard/fab-tex/purchase/purchase-order')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete Purchase Order' }
    }
}

// Fetchers
export async function getPurchaseOrders(segment?: string) {
    try {
        const company = await prisma.company.findFirst()
        if (!company) return []

        return await prisma.purchaseOrder.findMany({
            where: {
                companyId: company.id,
                ...(segment && { segment: segment as any })
            },
            include: {
                account: true,
                warehouse: true,
                items: {
                    include: {
                        grnItems: true,
                        invoiceItems: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error('getPurchaseOrders Error:', error)
        return []
    }
}

export async function getPurchaseOrderById(id: string) {
    console.log('getPurchaseOrderById: id =', id)
    return await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    itemMaster: { include: { packingUnit: true } },
                    color: true,
                    brand: true,
                    unit: true,
                    packingUnit: true,
                    grnItems: true,
                    invoiceItems: true,
                }
            },
            account: true,
            warehouse: true,
            company: true
        }
    })
}
