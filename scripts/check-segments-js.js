
const { PrismaClient } = require('c:/Abdullah/IHS-ERP/app/generated/prisma');
const prisma = new PrismaClient();

async function checkSegments() {
    console.log('--- Checking Segment Distribution ---');

    const models = [
        { name: 'ItemMaster', model: prisma.itemMaster },
        { name: 'PurchaseOrder', model: prisma.purchaseOrder },
        { name: 'GRN', model: prisma.gRN },
        { name: 'PurchaseInvoice', model: prisma.purchaseInvoice },
        { name: 'PurchaseReturn', model: prisma.purchaseReturn },
        { name: 'Warehouse', model: prisma.warehouse },
        { name: 'Account', model: prisma.account }
    ];

    for (const { name, model } of models) {
        if (!model) {
            console.log(`${name}: Model not found in client`);
            continue;
        }
        const yarnCount = await model.count({ where: { segment: 'YARN' } });
        const generalCount = await model.count({ where: { segment: 'GENERAL' } });
        const totalCount = await model.count();

        console.log(`${name}:`);
        console.log(`  Total: ${totalCount}`);
        console.log(`  YARN: ${yarnCount}`);
        console.log(`  GENERAL: ${generalCount}`);
        console.log('-----------------------------------');
    }
}

checkSegments()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
