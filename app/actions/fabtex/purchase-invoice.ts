'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
export async function debugPOData(poId: string) {
    try {
        console.log(`[DEBUG_PO] Fetching deep data for PO ID: ${poId}...`)
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: poId },
            include: {
                items: {
                    include: {
                        itemMaster: true,
                        grnItems: true,
                        invoiceItems: true
                    }
                },
                grns: {
                    include: {
                        items: true
                    }
                }
            }
        })
        if (!po) {
            console.log(`[DEBUG_PO] PO ${poId} not found in DB!`)
            return
        }
        console.log(`[DEBUG_PO] PO Number: ${po.poNumber} | Status: ${po.status}`)
        console.log(`[DEBUG_PO] Items Found: ${po.items.length}`)
        po.items.forEach((it, i) => {
            console.log(`[DEBUG_PO] Item[${i}]: ${it.itemMaster?.name} | Qty: ${it.quantity} | GRN Links: ${it.grnItems.length}`)
        })
        console.log(`[DEBUG_PO] GRNs Found: ${po.grns.length}`)
        po.grns.forEach((g, i) => {
            console.log(`[DEBUG_PO] GRN[${i}]: ${g.id} | Items: ${g.items.length}`)
        })
    } catch (e: any) {
        console.error(`[DEBUG_PO] ERROR:`, e.message)
    }
}

export async function getInvoiceFormData() {
    const [{ pos: purchaseOrders, allEligibleGRNs }, accounts, itemMasters, units, colors, brands, itemGrades, packingUnits] = await Promise.all([
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
        prisma.packingUnit.findMany({ orderBy: { name: 'asc' } })
    ])

    return {
        purchaseOrders,
        accounts,
        itemMasters,
        units,
        colors,
        brands,
        itemGrades,
        packingUnits,
        allEligibleGRNs
    }
}


export type InvoiceState = {
    success: boolean
    message?: string
    error?: string
}

export async function getEligibleForInvoicing() {
    console.log(`[SERVER] Fetching eligible POs at ${new Date().toLocaleTimeString()}...`)
    const pos = await prisma.purchaseOrder.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING', 'COMPLETED', 'DRAFT'] }
        },
        include: {
            account: true,
            grns: {
                include: {
                    items: {
                        include: {
                            itemMaster: true,
                            unit: true,
                            color: true,
                            brand: true,
                            itemGrade: true,
                            packingUnit: true
                        }
                    }
                }
            },
            items: {
                include: {
                    itemMaster: true,
                    grnItems: true,
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
    console.log(`[SERVER] Found ${pos.length} eligible POs`)
    pos.forEach((po, index) => {
        try {
            console.log(`[SERVER] PO[${index}]: ${po.poNumber} (ID: ${po.id})`)
            console.log(`   - Items Count: ${po.items?.length || 0}`)
            console.log(`   - GRNs Count: ${po.grns?.length || 0}`)
            if (po.items && po.items.length > 0) {
                console.log(`   - First Item: ${po.items[0].itemMaster?.name || 'No ItemMaster'} | Qty: ${po.items[0].quantity}`)
            }
        } catch (e: any) {
            console.log(`[SERVER] Error logging PO[${index}]:`, e.message)
        }
    })
    // Flatten all GRNs for direct selection if needed
    const allEligibleGRNs = pos.flatMap(po =>
        (po.grns || []).map(grn => ({
            ...grn,
            poNumber: po.poNumber,
            vendorName: po.account?.name || po.partyName
        }))
    )

    return { pos, allEligibleGRNs }
}


export async function createPurchaseInvoice(prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findFirst()
        if (!company) return { success: false, error: 'No company defined' }

        const purchaseOrderId = formData.get('purchaseOrderId') as string || null
        const accountId = formData.get('accountId') ? parseInt(formData.get('accountId') as string) : null

        const invoiceNumber = formData.get('invoiceNumber') as string
        const supplierInvoiceNo = formData.get('supplierInvoiceNo') as string
        const date = formData.get('date') as string
        const status = formData.get('status') as string || 'UNPAID'
        const remarks = formData.get('remarks') as string

        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!items || items.length === 0) {
            return { success: false, error: 'No items in invoice' }
        }

        const totalAmount = items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0)

        await prisma.purchaseInvoice.create({
            data: {
                invoiceNumber,
                supplierInvoiceNo,
                date: new Date(date),
                purchaseOrderId: purchaseOrderId || undefined,
                accountId,
                remarks,
                totalAmount,
                status,
                companyId: company.id,
                items: {
                    create: items.map((item: any) => ({
                        purchaseOrderItemId: item.purchaseOrderItemId || null,
                        grnItemId: item.grnItemId || null,
                        itemMasterId: item.itemMasterId || null,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        unitId: item.unitId ? parseInt(item.unitId) : null,
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


export async function updatePurchaseInvoice(invoiceId: string, prevState: InvoiceState, formData: FormData): Promise<InvoiceState> {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const purchaseOrderId = formData.get('purchaseOrderId') as string || null
        const accountId = formData.get('accountId') ? parseInt(formData.get('accountId') as string) : null

        const invoiceNumber = formData.get('invoiceNumber') as string
        const supplierInvoiceNo = formData.get('supplierInvoiceNo') as string
        const date = formData.get('date') as string
        const status = formData.get('status') as string || 'UNPAID'
        const remarks = formData.get('remarks') as string

        const itemsJson = formData.get('items') as string
        const items = JSON.parse(itemsJson)

        if (!invoiceId || !items || items.length === 0) {
            return { success: false, error: 'Invalid Invoice data' }
        }

        const totalAmount = items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0)

        await prisma.purchaseInvoice.update({
            where: { id: invoiceId },
            data: {
                invoiceNumber,
                supplierInvoiceNo,
                date: new Date(date),
                purchaseOrderId: purchaseOrderId || null,
                accountId,
                remarks,
                totalAmount,
                status,
                items: {
                    deleteMany: {},
                    create: items.map((item: any) => ({
                        purchaseOrderItemId: item.purchaseOrderItemId || null,
                        grnItemId: item.grnItemId || null,
                        itemMasterId: item.itemMasterId || null,
                        colorId: item.colorId || null,
                        brandId: item.brandId || null,
                        itemGradeId: item.itemGradeId || null,
                        unitId: item.unitId ? parseInt(item.unitId) : null,
                        invoicedQty: parseFloat(item.invoicedQty),
                        rate: parseFloat(item.rate),
                        amount: parseFloat(item.amount)
                    }))
                }
            }
        })

        revalidatePath('/dashboard/fab-tex/purchase/invoice')
        return { success: true, message: 'Purchase Invoice updated successfully' }
    } catch (error: any) {
        console.error('INVOICE_UPDATE_ERROR:', error)
        return { success: false, error: error.message || 'Failed to update Invoice' }
    }
}


export async function getPurchaseInvoices() {
    console.log('Fetching all purchase invoices...')
    return await prisma.purchaseInvoice.findMany({
        include: {
            purchaseOrder: {
                include: { account: true }
            },
            account: true,
            items: {
                include: {
                    purchaseOrderItem: {
                        include: { itemMaster: true }
                    },
                    itemMaster: true
                }
            }
        },
        orderBy: { date: 'desc' }
    })
}


export async function getPurchaseInvoiceById(id: string) {
    console.log('Fetching purchase invoice by ID:', id)
    return await prisma.purchaseInvoice.findUnique({
        where: { id },
        include: {
            purchaseOrder: {
                include: { account: true }
            },
            account: true,
            items: {
                include: {
                    purchaseOrderItem: {
                        include: {
                            itemMaster: true,
                            unit: true,
                            color: true,
                            brand: true,
                            itemGrade: true,
                            packingUnit: true
                        }
                    },
                    grnItem: true,
                    itemMaster: true,
                    unit: true,
                    color: true,
                    brand: true,
                    itemGrade: true
                }
            }
        }
    })
}

