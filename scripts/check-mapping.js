const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: {
                grns: true,
                items: true
            }
        });

        console.log('Total POs:', pos.length);
        pos.forEach(po => {
            console.log(`PO: ${po.poNumber} | Status: ${po.status} | GRNs: ${po.grns.length} | Items: ${po.items.length}`);
        });

        const grns = await prisma.gRN.findMany({
            include: { items: true }
        });
        console.log('Total GRNs:', grns.length);
        grns.forEach(grn => {
            console.log(`GRN: ${grn.grnNumber} | PO ID: ${grn.purchaseOrderId} | Items: ${grn.items.length}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
