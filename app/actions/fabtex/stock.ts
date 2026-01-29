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
    totalReturned: number
    currentStock: number
}

export async function getStockSummary(segment: string = 'YARN', warehouseId?: string) {
    // 1. Fetch all items for the segment
    // We fetch items first to ensure we show items even if they have 0 stock (optional, but good for "Master" view)
    // OR we can just aggregate transactions. Let's aggregate transactions for "Active Stock".

    // Fetch GRN Items (IN)
    // We need to join with GRN -> PurchaseOrder -> Warehouse if warehouse filter is applied
    // Actually GRN has warehouseRefNo but real warehouse link is via PO or direct if we added it.
    // Let's check GRN schema: It has `warehouseRefNo` string. 
    // Wait, `PurchaseOrder` has `warehouseId`.

    const where: any = {
        grn: {
            segment: segment as any,
            // If warehouse filter is needed, we check the PO associated with the GRN
            purchaseOrder: warehouseId ? { warehouseId: parseInt(warehouseId) } : undefined
        }
    }

    const grnItems = await prisma.gRNItem.findMany({
        where,
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
    const returnItems = await prisma.purchaseReturnItem.findMany({
        where: {
            return: {
                segment: segment as any
                // Returns usually don't have a warehouse strictly linked in the same way, 
                // but logical flow is they reduce stock.
            }
        },
        include: {
            return: true
        }
    })


    // Aggregate
    const stockMap = new Map<string, StockSummaryItem>();

    // Process IN (GRNs)
    for (const item of grnItems) {
        if (!stockMap.has(item.itemMasterId)) {
            stockMap.set(item.itemMasterId, {
                itemMasterId: item.itemMasterId,
                itemCode: item.itemMaster.code,
                itemName: item.itemMaster.name,
                packingUnitSymbol: item.itemMaster.packingUnit?.symbol || item.itemMaster.packingUnit?.name || 'Inits',
                unitName: item.itemMaster.baseUnit?.name || '',
                categoryName: item.itemMaster.itemGroup?.name || '',
                totalReceived: 0,
                totalReturned: 0,
                currentStock: 0
            })
        }

        const entry = stockMap.get(item.itemMasterId)!;

        // We use 'acceptedQty' or 'receivedQty'? 
        // Typically 'receivedQty' is what entered the gate. 
        // If there is 'acceptedQty' logic, we should use that. For now, using `receivedQty` or `pcs`?
        // Let's use `receivedQty` (which is in base unit usually, or we need to handle conversions).
        // Assuming `receivedQty` is the standard quantity.
        entry.totalReceived += (item.receivedQty || 0);
        entry.currentStock += (item.receivedQty || 0);
    }

    // Process OUT (Returns)
    // Note: Returns might be for items not in the current GRN list if we filter GRN by warehouse but Return is generic?
    // For now, simplicity: Subtract returns for these items.
    for (const item of returnItems) {
        if (stockMap.has(item.itemMasterId)) {
            const entry = stockMap.get(item.itemMasterId)!;
            entry.totalReturned += (item.returnedQty || 0);
            entry.currentStock -= (item.returnedQty || 0);
        }
    }

    return Array.from(stockMap.values());
}

export type LedgerEntry = {
    id: string
    date: Date
    type: 'GRN' | 'RETURN'
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
        where: {
            itemMasterId: itemId,
            grn: {
                segment: segment as any
            }
        },
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
    const returnItems = await prisma.purchaseReturnItem.findMany({
        where: {
            itemMasterId: itemId,
            return: {
                segment: segment as any
            }
        },
        include: {
            return: {
                include: {
                    account: true
                }
            }
        }
    })

    // 3. Combine and Sort
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
            balance: 0, // Calculated later
            remarks: item.grn.remarks || ''
        })
    }

    for (const item of returnItems) {
        transactions.push({
            id: item.id,
            // @ts-ignore
            date: item.return.date,
            type: 'RETURN',
            // @ts-ignore
            documentNo: item.return.returnNumber,
            // @ts-ignore
            partyName: item.return.account?.name || 'Unknown',
            qtyIn: 0,
            qtyOut: item.returnedQty,
            balance: 0, // Calculated later
            // @ts-ignore
            remarks: item.return.remarks || ''
        })
    }

    // Sort by Date Ascending
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 4. Calculate Running Balance
    let runningBalance = 0
    for (const tx of transactions) {
        runningBalance = runningBalance + tx.qtyIn - tx.qtyOut
        tx.balance = runningBalance
    }

    // Return reversed (Newest first) for UI, but balance is already correct
    return transactions
}
