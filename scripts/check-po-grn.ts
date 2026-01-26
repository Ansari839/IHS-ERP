import { PrismaClient } from '../app/generated/prisma'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function check() {
    try {
        console.log('--- Checking PO-0001 details (TS) ---')
        const po = await prisma.purchaseOrder.findFirst({
            where: { poNumber: 'PO-0001' },
            include: {
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
                },
                grns: {
                    include: {
                        items: {
                            include: {
                                itemMaster: true
                            }
                        }
                    }
                }
            }
        })

        if (!po) {
            console.log('PO-0001 not found!')
            return
        }

        console.log('PO Found:', JSON.stringify({
            id: po.id,
            poNumber: po.poNumber,
            status: po.status,
            itemsCount: po.items.length,
            grnsCount: po.grns.length
        }, null, 2))

        po.items.forEach((item, i) => {
            console.log(`Item[${i}]: ${item.itemMaster?.name}, Qty: ${item.quantity}, GRN Links: ${item.grnItems.length}`)
        })

        po.grns.forEach((grn, i) => {
            console.log(`GRN[${i}]: ${grn.id}, Date: ${grn.date}, Items: ${grn.items.length}`)
        })

    } catch (e: any) {
        console.error('Error during check:', e)
    } finally {
        await prisma.$disconnect()
    }
}

check()
