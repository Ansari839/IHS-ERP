require('dotenv').config();
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- Checking PO-0001 details ---');
        const po = await prisma.purchaseOrder.findFirst({
            where: { poNumber: 'PO-0001' },
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
        });

        if (!po) {
            console.log('PO-0001 not found!');
            return;
        }

        console.log('PO Found:', {
            id: po.id,
            poNumber: po.poNumber,
            status: po.status,
            itemsCount: po.items.length,
            grnsCount: po.grns.length
        });

        po.items.forEach((item, i) => {
            console.log(`Item[${i}]: ${item.itemMaster?.name || 'No master'}, Qty: ${item.quantity}, GRN Links: ${item.grnItems.length}`);
        });

        po.grns.forEach((grn, i) => {
            console.log(`GRN[${i}]: ${grn.id}, Date: ${grn.date}, Items in GRN: ${grn.items.length}`);
        });

    } catch (e) {
        console.error('Error during check:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
