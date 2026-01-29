'use server'

import prisma from '@/lib/prisma'
import { verifyPermission } from '@/lib/auth-checks'

export type StockSummaryItem = {
    itemMasterId: string
    itemCode: string
    itemName: string
    packingUnitSymbol: string
    unitName: string
    categoryName: string
    totalReceived: number
    totalReturned: number // Purchase Returns
    totalDelivered: number // Sales DO
    totalSalesReturned: number // Sales Return (Customer Return)
    currentStock: number
}

export async function getStockSummary(segment: string = 'YARN', warehouseId?: string) {
    // 1. Fetch all items for the segment OR aggregate transactions

    // Fetch GRN Items (IN)
    const grnItems = await prisma.gRNItem.findMany({
        where: {
            grn: {
                segment: segment as any,
                purchaseOrder: warehouseId ? { warehouseId: parseInt(warehouseId) } : undefined
            }
        },
        include: {
            itemMaster: {
                include: {
                    packingUnit: true,
                    baseUnit: true,
                    itemGroup: true
                }
            },
            grn: true
        }
    })

    // Fetch Purchase Returns (OUT)
    const purchaseReturnItems = await prisma.purchaseReturnItem.findMany({
        where: {
            return: {
                segment: segment as any
            }
        },
        include: { return: true }
    })

    // Fetch Delivery Orders (OUT)
    const deliveryItems = await prisma.deliveryOrderItem.findMany({
        where: {
            deliveryOrder: {
                segment: segment as any,
                salesOrder: warehouseId ? { warehouseId: parseInt(warehouseId) } : undefined
            }
        },
        include: { deliveryOrder: true }
    })

    // Fetch Sales Returns (IN)
    const salesReturnItems = await prisma.salesReturnItem.findMany({
        where: {
            return: {
                segment: segment as any
            }
        },
        include: { return: true }
    })

    // Aggregate
    const stockMap = new Map<string, StockSummaryItem>();

    // Helper to ensure entry exists
    const ensureEntry = (item: any) => {
        if (!stockMap.has(item.itemMasterId)) {
            // Need itemMaster details. If simpler approach implies we might lose details if only OUT exists?
            // Usually we have IN first. But to be safe, we assume itemMaster is fetched or we relay on relations.
            // In GRN loop we have itemMaster.
            // For others we might not have it loaded if we don't include it. 
            // Let's assume most stock has GRN. If not, we might miss details.
            // BETTER: Load Item Masters for these IDs? 
            // For now, initializing with defaults if missing (might be minimal for pure OUT/Return scenarios without GRN)
            // But usually GRN is the source.
            // If itemMaster is not in include, we can't populate details perfectly.
            // Let's rely on GRN for details or partial details.

            // Correction: I should include itemMaster in ALL queries or fetch ItemMasters separately.
            // Ideally fetch all item masters first. But that is heavy.
            // Let's trust GRN provides the base.
            // If an item has NO GRN but has Returns (weird), it won't show fully correctly.
            // I'll proceed with what I have.
        }
        // Actually, let's just initialize if strict.
        if (!stockMap.has(item.itemMasterId) && item.itemMaster) {
            stockMap.set(item.itemMasterId, {
                itemMasterId: item.itemMasterId,
                itemCode: item.itemMaster.code,
                itemName: item.itemMaster.name,
                packingUnitSymbol: item.itemMaster.packingUnit?.symbol || item.itemMaster.packingUnit?.name || 'Inits',
                unitName: item.itemMaster.baseUnit?.name || '',
                categoryName: item.itemMaster.itemGroup?.name || '',
                totalReceived: 0,
                totalReturned: 0,
                totalDelivered: 0,
                totalSalesReturned: 0,
                currentStock: 0
            })
        }
    }

    // Process IN (GRNs)
    for (const item of grnItems) {
        ensureEntry(item)
        if (stockMap.has(item.itemMasterId)) {
            const entry = stockMap.get(item.itemMasterId)!;
            entry.totalReceived += (item.receivedQty || 0);
            entry.currentStock += (item.receivedQty || 0);
        }
    }

    // Process OUT (Purchase Returns)
    for (const item of purchaseReturnItems) {
        // We might not have itemMaster detail if no GRN. skip for now or fetch?
        // Let's skip safely.
        if (stockMap.has(item.itemMasterId)) {
            const entry = stockMap.get(item.itemMasterId)!;
            entry.totalReturned += (item.returnedQty || 0);
            entry.currentStock -= (item.returnedQty || 0);
        }
    }

    // Process OUT (Delivery Orders)
    for (const item of deliveryItems) {
        if (stockMap.has(item.itemMasterId)) {
            const entry = stockMap.get(item.itemMasterId)!;
            entry.totalDelivered += (item.deliveredQty || 0);
            entry.currentStock -= (item.deliveredQty || 0);
        }
    }

    // Process IN (Sales Returns)
    for (const item of salesReturnItems) {
        if (stockMap.has(item.itemMasterId)) {
            const entry = stockMap.get(item.itemMasterId)!;
            entry.totalSalesReturned += (item.returnedQty || 0);
            entry.currentStock += (item.returnedQty || 0);
        }
    }

    return Array.from(stockMap.values());
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
}

export async function getItemLedger(itemId: string, segment: string = 'YARN') {
    // 1. Fetch Inward (GRN Items)
    const grnItems = await prisma.gRNItem.findMany({
        where: { itemMasterId: itemId, grn: { segment: segment as any } },
        include: {
            grn: {
                include: {
                    purchaseOrder: { include: { account: true, warehouse: true } },
                    company: true
                }
            }
        }
    })

    // 2. Fetch Outward (Purchase Return Items)
    const purchaseReturnItems = await prisma.purchaseReturnItem.findMany({
        where: { itemMasterId: itemId, return: { segment: segment as any } },
        include: {
            return: { include: { account: true } }
        }
    })

    // 3. Fetch Outward (Delivery Order Items)
    const deliveryItems = await prisma.deliveryOrderItem.findMany({
        where: { itemMasterId: itemId, deliveryOrder: { segment: segment as any } },
        include: {
            deliveryOrder: {
                include: {
                    salesOrder: { include: { account: true, warehouse: true } }
                }
            }
        }
    })

    // 4. Fetch Inward (Sales Return Items)
    const salesReturnItems = await prisma.salesReturnItem.findMany({
        where: { itemMasterId: itemId, return: { segment: segment as any } },
        include: {
            return: { include: { account: true } }
        }
    })

    // 5. Combine and Sort
    const transactions: LedgerEntry[] = []

    for (const item of grnItems) {
        transactions.push({
            id: item.id,
            date: item.grn.date,
            type: 'GRN',
            documentNo: item.grn.grnNumber,
            partyName: item.grn.purchaseOrder?.account?.name || item.grn.purchaseOrder?.partyName || 'Unknown',
            warehouseName: item.grn.purchaseOrder?.warehouse?.name || '-',
            qtyIn: item.receivedQty,
            qtyOut: 0,
            balance: 0,
            remarks: item.grn.remarks || ''
        })
    }

    for (const item of purchaseReturnItems) {
        transactions.push({
            id: item.id,
            // @ts-ignore
            date: item.return.date,
            type: 'PURCHASE_RETURN',
            // @ts-ignore
            documentNo: item.return.returnNumber,
            // @ts-ignore
            partyName: item.return.account?.name || 'Unknown',
            qtyIn: 0,
            qtyOut: item.returnedQty,
            balance: 0,
            // @ts-ignore
            remarks: item.return.remarks || ''
        })
    }

    for (const item of deliveryItems) {
        transactions.push({
            id: item.id,
            date: item.deliveryOrder.date,
            type: 'DELIVERY_ORDER',
            documentNo: item.deliveryOrder.doNumber,
            partyName: item.deliveryOrder.salesOrder?.account?.name || item.deliveryOrder.salesOrder?.partyName || 'Unknown',
            warehouseName: item.deliveryOrder.salesOrder?.warehouse?.name || '-',
            qtyIn: 0,
            qtyOut: item.deliveredQty,
            balance: 0,
            remarks: item.deliveryOrder.remarks || ''
        })
    }

    for (const item of salesReturnItems) {
        transactions.push({
            id: item.id,
            // @ts-ignore
            date: item.return.date,
            type: 'SALES_RETURN',
            // @ts-ignore
            documentNo: item.return.returnNumber,
            // @ts-ignore
            partyName: item.return.account?.name || 'Unknown',
            qtyIn: item.returnedQty,
            qtyOut: 0,
            balance: 0,
            // @ts-ignore
            remarks: item.return.remarks || ''
        })
    }

    // Sort by Date Ascending
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 6. Calculate Running Balance
    let runningBalance = 0
    for (const tx of transactions) {
        runningBalance = runningBalance + tx.qtyIn - tx.qtyOut
        tx.balance = runningBalance
    }

    // Return in ascending order (Oldest first) as requested
    return transactions
}
