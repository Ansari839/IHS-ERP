const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    try {
        const items = await prisma.purchaseOrderItem.findMany({
            include: {
                itemMaster: {
                    include: { packingUnit: true }
                },
                packingUnit: true
            },
            take: 20,
            orderBy: { createdAt: 'desc' }
        });

        console.log('--- Purchase Order Item Packing Audit ---');
        items.forEach(item => {
            console.log(`Item: ${item.itemMaster?.name}`);
            console.log(`  PO ID: ${item.purchaseOrderId}`);
            console.log(`  Item P.Unit (Saved): ${item.packingUnit?.symbol || 'NULL'} (ID: ${item.packingUnitId || 'NULL'})`);
            console.log(`  ItemMaster P.Unit (Default): ${item.itemMaster?.packingUnit?.symbol || 'NULL'} (ID: ${item.itemMaster?.packingUnitId || 'NULL'})`);
            console.log('----------------------------');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
