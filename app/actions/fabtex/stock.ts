'use server'

import prisma from '@/lib/prisma'
import { verifyPermission } from '@/lib/auth-checks'

export type StockSummaryItem = {
    id: string // composite key
    itemMasterId: string
    itemCode: string
    itemName: string
    warehouseId: number | null
    warehouseName: string
    warehouseRefNo: string
    fileNo: string
    lotNo: string
    colorId: string | null
    colorName: string
    brandId: string | null
    brandName: string
    itemGradeId: string | null
    gradeName: string
    packingUnitId: string | null
    packingUnitSymbol: string
    packingType: string | null
    unitSize: number | null
    totalIn: number
    totalOut: number
    currentStock: number
    pcs: number
}

export async function getStockSummary(segment: string = 'YARN', warehouseId?: string) {
    const filters = {
        segment: segment as any,
        warehouseId: warehouseId ? parseInt(warehouseId) : undefined
    }

    // 1. Fetch IN (GRNs)
    const grnItems = await prisma.gRNItem.findMany({
        where: {
            grn: {
                segment: filters.segment,
                purchaseOrder: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined
            }
        },
        include: {
            itemMaster: { include: { packingUnit: true, baseUnit: true, itemGroup: true } },
            grn: { include: { purchaseOrder: { include: { warehouse: true } } } },
            color: true,
            brand: true,
            itemGrade: true,
            packingUnit: true
        }
    })

    // 2. Fetch OUT (Purchase Returns)
    const purchaseReturnItems = await prisma.purchaseReturnItem.findMany({
        where: {
            return: {
                segment: filters.segment,
                grn: filters.warehouseId ? { purchaseOrder: { warehouseId: filters.warehouseId } } : undefined
            }
        },
        include: {
            return: { include: { grn: { include: { purchaseOrder: { include: { warehouse: true } } } } } },
            itemMaster: true,
            color: true,
            brand: true,
            itemGrade: true
        }
    })

    // 3. Fetch OUT (Delivery Orders)
    const deliveryItems = await prisma.deliveryOrderItem.findMany({
        where: {
            deliveryOrder: {
                segment: filters.segment,
                warehouseId: filters.warehouseId
            }
        },
        include: {
            deliveryOrder: { include: { warehouse: true, salesOrder: true } },
            itemMaster: true,
            color: true,
            brand: true,
            itemGrade: true
        }
    })

    // 4. Fetch IN (Sales Returns)
    const salesReturnItems = await prisma.salesReturnItem.findMany({
        where: {
            return: {
                segment: filters.segment,
                deliveryOrder: filters.warehouseId ? { warehouseId: filters.warehouseId } : undefined
            }
        },
        include: {
            return: { include: { deliveryOrder: { include: { warehouse: true, salesOrder: true } } } },
            itemMaster: true,
            color: true,
            brand: true,
            itemGrade: true
        }
    })

    const stockMap = new Map<string, StockSummaryItem>();

    const getBatchKey = (item: any, type: 'GRN' | 'PR' | 'DO' | 'SR') => {
        let whId = '';
        let whRef = '';
        let file = '';
        let lot = '';
        let pkgType = item.packingType || 'EVEN';
        let uSize = item.unitSize || 0;

        if (type === 'GRN') {
            whId = item.grn.purchaseOrder?.warehouseId?.toString() || '';
            whRef = item.warehouseRefNo || item.grn.warehouseRefNo || '';
            file = item.grn.purchaseOrder?.fileNo || '';
            lot = item.lotNo || item.grn.lotNo || '';
        } else if (type === 'DO') {
            whId = item.deliveryOrder.warehouseId?.toString() || '';
            whRef = item.deliveryOrder.warehouseRefNo || '';
            file = item.deliveryOrder.salesOrder?.fileNo || '';
            // DO items usually don't have distinct lotNo themselves but link to PO/GRN in a full system
            // For now we use header lot if applicable or empty
        } else if (type === 'PR') {
            whId = item.return.grn?.purchaseOrder?.warehouseId?.toString() || '';
            whRef = item.return.grn?.warehouseRefNo || '';
            file = item.return.returnNumber || '';
        } else if (type === 'SR') {
            whId = item.return.deliveryOrder?.warehouseId?.toString() || '';
            whRef = item.return.deliveryOrder?.warehouseRefNo || '';
            file = item.return.returnNumber || '';
        }

        return `${item.itemMasterId}-${whId}-${item.colorId || 'none'}-${item.brandId || 'none'}-${item.itemGradeId || 'none'}-${pkgType}-${uSize}-${whRef}-${lot}-${file}`;
    }

    const ensureEntry = (item: any, type: 'GRN' | 'PR' | 'DO' | 'SR') => {
        const key = getBatchKey(item, type);
        if (!stockMap.has(key)) {
            let whId = null;
            let whName = '-';
            let whRef = '';
            let file = '';
            let lot = '';

            if (type === 'GRN') {
                whId = item.grn.purchaseOrder?.warehouseId || null;
                whName = item.grn.purchaseOrder?.warehouse?.name || '-';
                whRef = item.warehouseRefNo || item.grn.warehouseRefNo || '';
                file = item.grn.purchaseOrder?.fileNo || '';
                lot = item.lotNo || item.grn.lotNo || '';
            } else if (type === 'DO') {
                whId = item.deliveryOrder.warehouseId || null;
                whName = item.deliveryOrder.warehouse?.name || '-';
                whRef = item.deliveryOrder.warehouseRefNo || '';
                file = item.deliveryOrder.salesOrder?.fileNo || '';
            } else if (type === 'PR') {
                whId = item.return.grn?.purchaseOrder?.warehouseId || null;
                whName = item.return.grn?.purchaseOrder?.warehouse?.name || '-';
                whRef = item.return.grn?.warehouseRefNo || '';
                file = item.return.grn?.purchaseOrder?.fileNo || '';
            } else if (type === 'SR') {
                whId = item.return.deliveryOrder?.warehouseId || null;
                whName = item.return.deliveryOrder?.warehouse?.name || '-';
                whRef = item.return.deliveryOrder?.warehouseRefNo || '';
                file = item.return.deliveryOrder?.salesOrder?.fileNo || '';
            }

            stockMap.set(key, {
                id: key,
                itemMasterId: item.itemMasterId,
                itemCode: item.itemMaster?.code || '-',
                itemName: item.itemMaster?.name || '-',
                warehouseId: whId,
                warehouseName: whName,
                warehouseRefNo: whRef,
                fileNo: file,
                lotNo: lot,
                colorId: item.colorId || null,
                colorName: item.color?.name || '-',
                brandId: item.brandId || null,
                brandName: item.brand?.name || '-',
                itemGradeId: item.itemGradeId || null,
                gradeName: item.itemGrade?.name || '-',
                packingUnitId: item.packingUnitId || item.itemMaster?.packingUnitId || null,
                packingUnitSymbol: item.packingUnit?.symbol || item.itemMaster?.packingUnit?.symbol || '-',
                packingType: item.packingType || 'EVEN',
                unitSize: item.unitSize || 0,
                totalIn: 0,
                totalOut: 0,
                currentStock: 0,
                pcs: 0
            })
        }
        return stockMap.get(key)!;
    }

    // Accumulate
    for (const item of grnItems) {
        const entry = ensureEntry(item, 'GRN');
        entry.totalIn += (item.receivedQty || 0);
        entry.currentStock += (item.receivedQty || 0);
        entry.pcs += (item.pcs || 0);
    }

    for (const item of purchaseReturnItems) {
        if (!item.itemMaster) continue; // safety
        const entry = ensureEntry(item, 'PR');
        entry.totalOut += (item.returnedQty || 0);
        entry.currentStock -= (item.returnedQty || 0);
        // PR items in schema lack pcs
    }

    for (const item of deliveryItems) {
        if (!item.itemMaster) continue;
        const entry = ensureEntry(item, 'DO');
        entry.totalOut += (item.deliveredQty || 0);
        entry.currentStock -= (item.deliveredQty || 0);
        entry.pcs -= (item.pcs || 0);
    }

    for (const item of salesReturnItems) {
        if (!item.itemMaster) continue;
        const entry = ensureEntry(item, 'SR');
        entry.totalIn += (item.returnedQty || 0);
        entry.currentStock += (item.returnedQty || 0);
        // Sales Return items in schema lack pcs
    }

    return Array.from(stockMap.values()).filter(item => Math.abs(item.currentStock) > 0.0001);
}

export type LedgerEntry = {
    id: string
    date: Date
    type: 'GRN' | 'PURCHASE_RETURN' | 'DELIVERY_ORDER' | 'SALES_RETURN'
    documentNo: string
    partyName: string
    qtyIn: number
    qtyOut: number
    balance: number
    remarks?: string
    warehouseName?: string
    colorName?: string
    brandName?: string
}

export async function getItemLedger(itemId: string, segment: string = 'YARN', colorId?: string) {
    const commonWhere = {
        itemMasterId: itemId,
        colorId: colorId || undefined
    }

    // 1. Fetch Inward (GRN Items)
    const grnItems = await prisma.gRNItem.findMany({
        where: { ...commonWhere, grn: { segment: segment as any } },
        include: {
            grn: {
                include: {
                    purchaseOrder: { include: { account: true, warehouse: true } }
                }
            },
            color: true,
            brand: true
        }
    })

    // 2. Fetch Outward (Purchase Return Items)
    const purchaseReturnItems = await prisma.purchaseReturnItem.findMany({
        where: { ...commonWhere, return: { segment: segment as any } },
        include: {
            return: { include: { account: true, grn: { include: { purchaseOrder: { include: { warehouse: true } } } } } },
            color: true,
            brand: true
        }
    })

    // 3. Fetch Outward (Delivery Order Items)
    const deliveryItems = await prisma.deliveryOrderItem.findMany({
        where: { ...commonWhere, deliveryOrder: { segment: segment as any } },
        include: {
            deliveryOrder: {
                include: {
                    warehouse: true,
                    salesOrder: { include: { account: true } }
                }
            },
            color: true,
            brand: true
        }
    })

    // 4. Fetch Inward (Sales Return Items)
    const salesReturnItems = await prisma.salesReturnItem.findMany({
        where: { ...commonWhere, return: { segment: segment as any } },
        include: {
            return: { include: { account: true, deliveryOrder: { include: { warehouse: true } } } },
            color: true,
            brand: true
        }
    })

    const transactions: LedgerEntry[] = []

    for (const item of grnItems) {
        transactions.push({
            id: item.id,
            date: item.grn.date,
            type: 'GRN',
            documentNo: item.grn.grnNumber,
            partyName: item.grn.purchaseOrder?.account?.name || item.grn.purchaseOrder?.partyName || 'Unknown',
            warehouseName: item.grn.purchaseOrder?.warehouse?.name || '-',
            colorName: item.color?.name,
            brandName: item.brand?.name,
            qtyIn: item.receivedQty,
            qtyOut: 0,
            balance: 0,
            remarks: item.grn.remarks || ''
        })
    }

    for (const item of purchaseReturnItems) {
        transactions.push({
            id: item.id,
            date: item.return.date,
            type: 'PURCHASE_RETURN',
            documentNo: (item.return as any).returnNumber || '-',
            partyName: item.return.account?.name || 'Unknown',
            warehouseName: item.return.grn?.purchaseOrder?.warehouse?.name || '-',
            colorName: item.color?.name,
            brandName: item.brand?.name,
            qtyIn: 0,
            qtyOut: item.returnedQty,
            balance: 0,
            remarks: (item.return as any).remarks || ''
        })
    }

    for (const item of deliveryItems) {
        transactions.push({
            id: item.id,
            date: item.deliveryOrder.date,
            type: 'DELIVERY_ORDER',
            documentNo: item.deliveryOrder.doNumber,
            partyName: item.deliveryOrder.salesOrder?.account?.name || item.deliveryOrder.salesOrder?.partyName || 'Unknown',
            warehouseName: item.deliveryOrder.warehouse?.name || '-',
            colorName: item.color?.name,
            brandName: item.brand?.name,
            qtyIn: 0,
            qtyOut: item.deliveredQty,
            balance: 0,
            remarks: item.deliveryOrder.remarks || ''
        })
    }

    for (const item of salesReturnItems) {
        transactions.push({
            id: item.id,
            date: item.return.date,
            type: 'SALES_RETURN',
            documentNo: (item.return as any).returnNumber || '-',
            partyName: item.return.account?.name || 'Unknown',
            warehouseName: item.return.deliveryOrder?.warehouse?.name || '-',
            colorName: item.color?.name,
            brandName: item.brand?.name,
            qtyIn: item.returnedQty,
            qtyOut: 0,
            balance: 0,
            remarks: (item.return as any).remarks || ''
        })
    }

    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let runningBalance = 0
    for (const tx of transactions) {
        runningBalance = runningBalance + tx.qtyIn - tx.qtyOut
        tx.balance = runningBalance
    }

    return transactions
}
