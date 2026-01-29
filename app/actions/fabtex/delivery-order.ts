'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export type DOState = {
    success: boolean
    message?: string
    error?: string
}

export async function getSalesOrdersForDO() {
    const sos = await prisma.salesOrder.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING', 'DRAFT', 'COMPLETED'] }
        },
        include: {
            account: true,
            company: true,
            warehouse: true,
            items: {
                include: {
                    itemMaster: true,
                    color: true,
                    brand: true,
                    itemGrade: true,
                    unit: true,
                    packingUnit: true,
                    deliveryOrderItems: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Filter SOs that have remaining quantity to be delivered
    return sos.filter(so => {
        return (so.items || []).some(item => {
            const totalDelivered = (item.deliveryOrderItems || []).reduce((sum, doItem) => sum + (doItem.deliveredQty || 0), 0)
            return (item.quantity || 0) > totalDelivered
        })
    })
}

export async function getDOFormData() {
    const [salesOrders, accounts, itemMasters, units, colors, brands, itemGrades, packingUnits, warehouses] = await Promise.all([
        getSalesOrdersForDO(),
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
        warehouses
    }
}

export async function createDeliveryOrder(prevState: DOState, formData: FormData): Promise<DOState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const soId = formData.get('salesOrderId') as string || null
        const accountId = formData.get('accountId') as string || null
        const doNumber = formData.get('doNumber') as string
        const date = formData.get('date') as string
        const gatePassNo = formData.get('gatePassNo') as string
        const vehicleNo = formData.get('vehicleNo') as string
        const warehouseId = formData.get('warehouseId') ? parseInt(formData.get('warehouseId') as string, 10) : null
        const warehouseRefNo = formData.get('warehouseRefNo') as string
        const remarks = formData.get('remarks') as string
        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if ((!soId && !accountId) || !items || items.length === 0) {
            return { success: false, error: 'Invalid DO data. Please select a Sales Order or a Customer.' }
        }

        await prisma.deliveryOrder.create({
            data: {
                doNumber,
                date: new Date(date),
                salesOrderId: soId || null,
                accountId: accountId ? parseInt(accountId, 10) : null,
                gatePassNo: gatePassNo || null,
                vehicleNo: vehicleNo || null,
                warehouseId,
                warehouseRefNo: warehouseRefNo || null,
                remarks,
                companyId: company.id,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    create: items.map((item: any) => ({
                        salesOrderItemId: item.salesOrderItemId,
                        itemMasterId: item.itemMasterId,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        deliveredQty: parseFloat(item.deliveredQty),
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        packingType: item.packingType || null,
                        packingUnitId: (item.packingUnitId && item.packingUnitId !== 'none') ? item.packingUnitId : null,
                        unitId: item.unitId ? parseInt(item.unitId, 10) : null,
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/sales/delivery-order')
        return { success: true, message: 'Delivery Order created successfully' }
    } catch (error: any) {
        console.error('DO_CREATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to create DO' }
    }
}

export async function updateDeliveryOrder(id: string, prevState: DOState, formData: FormData): Promise<DOState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const soId = formData.get('salesOrderId') as string || null
        const accountId = formData.get('accountId') as string || null
        const doNumber = formData.get('doNumber') as string
        const date = formData.get('date') as string
        const gatePassNo = formData.get('gatePassNo') as string
        const vehicleNo = formData.get('vehicleNo') as string
        const warehouseId = formData.get('warehouseId') ? parseInt(formData.get('warehouseId') as string, 10) : null
        const warehouseRefNo = formData.get('warehouseRefNo') as string
        const remarks = formData.get('remarks') as string
        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!id || (!soId && !accountId) || !items || items.length === 0) {
            return { success: false, error: 'Invalid DO data' }
        }

        const startTime = Date.now()
        await prisma.deliveryOrder.update({
            where: { id },
            data: {
                doNumber,
                date: new Date(date),
                salesOrderId: soId || null,
                accountId: accountId ? parseInt(accountId, 10) : null,
                gatePassNo: gatePassNo || null,
                vehicleNo: vehicleNo || null,
                warehouseId,
                warehouseRefNo: warehouseRefNo || null,
                remarks,
                segment: (formData.get('segment') as any) || 'GENERAL',
                items: {
                    deleteMany: {}, // Delete old items
                    create: items.map((item: any) => ({
                        salesOrderItemId: item.salesOrderItemId || null,
                        itemMasterId: item.itemMasterId,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        deliveredQty: parseFloat(item.deliveredQty),
                        pcs: item.pcs ? parseFloat(item.pcs) : null,
                        unitSize: item.unitSize ? parseFloat(item.unitSize) : null,
                        packingType: item.packingType || null,
                        packingUnitId: (item.packingUnitId && item.packingUnitId !== 'none') ? item.packingUnitId : null,
                        unitId: item.unitId ? parseInt(item.unitId, 10) : null,
                    }))
                }
            }
        })
        console.log(`DO Update completed in ${Date.now() - startTime}ms`)

        revalidatePath('/dashboard/fab-tex/sales/delivery-order')
        return { success: true, message: 'DO updated successfully' }
    } catch (error: any) {
        console.error('DO_UPDATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to update DO' }
    }
}

export async function deleteDeliveryOrder(id: string): Promise<DOState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.deliveryOrder.delete({
            where: { id }
        })

        revalidatePath('/dashboard/fab-tex/sales/delivery-order')
        return { success: true, message: 'DO deleted successfully' }
    } catch (error: any) {
        console.error('DO_DELETE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to delete DO' }
    }
}

export async function getDeliveryOrders(segment?: string) {
    const company = await prisma.company.findFirst()
    if (!company) return []

    return await prisma.deliveryOrder.findMany({
        where: {
            companyId: company.id,
            ...(segment && { segment: segment as any })
        },
        include: {
            salesOrder: {
                include: { account: true }
            },
            account: true, // Added this
            items: {
                include: {
                    itemMaster: { include: { packingUnit: true } },
                    packingUnit: true
                }
            }
        },
        orderBy: { date: 'desc' }
    })
}

export async function getDeliveryOrderById(id: string) {
    return await prisma.deliveryOrder.findUnique({
        where: { id },
        include: {
            salesOrder: {
                include: {
                    account: true,
                    warehouse: true,
                    items: {
                        include: {
                            itemMaster: { include: { packingUnit: true } },
                            color: true,
                            brand: true,
                            itemGrade: true,
                            unit: true,
                            packingUnit: true,
                            deliveryOrderItems: true
                        }
                    }
                }
            },
            account: true,
            warehouse: true, // Added warehouse relation
            items: {
                include: {
                    itemMaster: { include: { packingUnit: true } },
                    color: true,
                    brand: true,
                    itemGrade: true,
                    unit: true,
                    packingUnit: true,
                    salesOrderItem: true // Include SO item for reference
                }
            },
            company: true
        }
    })
}
