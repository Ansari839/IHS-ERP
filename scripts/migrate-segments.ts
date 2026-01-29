
// Load environment variables first
import 'dotenv/config';
import prisma from '../lib/prisma';

async function migrate() {
    console.log('--- Starting Migration to YARN Segment ---');

    try {
        // Migrate Items
        // @ts-ignore
        const items = await prisma.itemMaster.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated ItemMaster: ${items.count}`);

        // Migrate POs
        // @ts-ignore
        const pos = await prisma.purchaseOrder.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated PurchaseOrder: ${pos.count}`);

        // Migrate GRNs
        // @ts-ignore
        const grns = await prisma.gRN.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated GRN: ${grns.count}`);

        // Migrate Invoices
        // @ts-ignore
        const invs = await prisma.purchaseInvoice.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated PurchaseInvoice: ${invs.count}`);

        // Migrate Returns
        // @ts-ignore
        const rets = await prisma.purchaseReturn.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated PurchaseReturn: ${rets.count}`);

        // Migrate Warehouses
        // @ts-ignore
        const whs = await prisma.warehouse.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        console.log(`Migrated Warehouse: ${whs.count}`);

        // Migrate Accounts
        // @ts-ignore
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
