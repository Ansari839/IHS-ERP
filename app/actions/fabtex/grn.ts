'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export type GRNState = {
    success: boolean
    message?: string
    error?: string
}

export async function getPurchaseOrdersForGRN() {
    return await prisma.purchaseOrder.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING', 'DRAFT', 'COMPLETED'] }
        },
        include: {
            account: true,
            items: {
                include: {
                    itemMaster: true,
                    color: true,
                    brand: true,
                    itemGrade: true,
                    unit: true,
                    packingUnit: true,
                    grnItems: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createGRN(prevState: GRNState, formData: FormData): Promise<GRNState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const poId = formData.get('purchaseOrderId') as string
        const grnNumber = formData.get('grnNumber') as string
        const date = formData.get('date') as string
        const lotNo = formData.get('lotNo') as string
        const warehouseRefNo = formData.get('warehouseRefNo') as string
        const remarks = formData.get('remarks') as string
        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!poId || !items || items.length === 0) {
            return { success: false, error: 'Invalid GRN data' }
        }

        await prisma.gRN.create({
            data: {
                grnNumber,
                date: new Date(date),
                purchaseOrderId: poId,
                lotNo: lotNo || null,
                warehouseRefNo: warehouseRefNo || null,
                remarks,
                companyId: company.id,
                items: {
                    create: items.map((item: any) => ({
                        purchaseOrderItemId: item.purchaseOrderItemId,
                        itemMasterId: item.itemMasterId,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        receivedQty: parseFloat(item.receivedQty),
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        packingType: item.packingType || null,
                        packingUnitId: (item.packingUnitId && item.packingUnitId !== 'none') ? item.packingUnitId : null,
                        unitId: item.unitId ? parseInt(item.unitId, 10) : null,
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/purchase/grn')
        return { success: true, message: 'GRN created successfully' }
    } catch (error: any) {
        console.error('GRN_CREATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to create GRN' }
    }
}

export async function updateGRN(id: string, prevState: GRNState, formData: FormData): Promise<GRNState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const grnNumber = formData.get('grnNumber') as string
        const date = formData.get('date') as string
        const lotNo = formData.get('lotNo') as string
        const warehouseRefNo = formData.get('warehouseRefNo') as string
        const remarks = formData.get('remarks') as string
        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!id || !items || items.length === 0) {
            return { success: false, error: 'Invalid GRN data' }
        }

        const startTime = Date.now()
        await prisma.gRN.update({
            where: { id },
            data: {
                grnNumber,
                date: new Date(date),
                lotNo: lotNo || null,
                warehouseRefNo: warehouseRefNo || null,
                remarks,
                items: {
                    deleteMany: {}, // Delete old items
                    create: items.map((item: any) => ({
                        purchaseOrderItemId: item.purchaseOrderItemId,
                        itemMasterId: item.itemMasterId,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        receivedQty: parseFloat(item.receivedQty),
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        packingType: item.packingType || null,
                        packingUnitId: (item.packingUnitId && item.packingUnitId !== 'none') ? item.packingUnitId : null,
                        unitId: item.unitId ? parseInt(item.unitId, 10) : null,
                    }))
                }
            }
        })
        console.log(`GRN Update completed in ${Date.now() - startTime}ms`)

        revalidatePath('/dashboard/fab-tex/purchase/grn')
        return { success: true, message: 'GRN updated successfully' }
    } catch (error: any) {
        console.error('GRN_UPDATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to update GRN' }
    }
}

export async function deleteGRN(id: string): Promise<GRNState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.gRN.delete({
            where: { id }
        })

        revalidatePath('/dashboard/fab-tex/purchase/grn')
        return { success: true, message: 'GRN deleted successfully' }
    } catch (error: any) {
        console.error('GRN_DELETE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to delete GRN' }
    }
}

export async function getGRNs() {
    return await prisma.gRN.findMany({
        include: {
            purchaseOrder: {
                include: { account: true }
            },
            items: {
                include: { itemMaster: true, packingUnit: true }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getGRNById(id: string) {
    return await prisma.gRN.findUnique({
        where: { id },
        include: {
            purchaseOrder: {
                include: {
                    account: true,
                    warehouse: true,
                    items: {
                        include: {
                            itemMaster: true,
                            color: true,
                            brand: true,
                            itemGrade: true,
                            unit: true,
                            packingUnit: true,
                            grnItems: true
                        }
                    }
                }
            },
            items: {
                include: {
                    itemMaster: true,
                    color: true,
                    brand: true,
                    itemGrade: true,
                    unit: true,
                    packingUnit: true
                }
            },
            company: true
        }
    })
}
