
const { PrismaClient } = require('c:/Abdullah/IHS-ERP/app/generated/prisma');
const prisma = new PrismaClient();

async function migrate() {
    console.log('--- Starting Migration to YARN Segment ---');

    try {
        // Migrate Items
        const items = await prisma.itemMaster.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated ItemMaster: ${items.count}`);

        // Migrate POs
        const pos = await prisma.purchaseOrder.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated PurchaseOrder: ${pos.count}`);

        // Migrate GRNs
        const grns = await prisma.gRN.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated GRN: ${grns.count}`);

        // Migrate Invoices
        const invs = await prisma.purchaseInvoice.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated PurchaseInvoice: ${invs.count}`);

        // Migrate Returns
        const rets = await prisma.purchaseReturn.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated PurchaseReturn: ${rets.count}`);

        // Migrate Warehouses
        const whs = await prisma.warehouse.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated Warehouse: ${whs.count}`);

        // Migrate Accounts
        const accs = await prisma.account.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated Account: ${accs.count}`);

        console.log('--- Migration Completed Successfully ---');

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
