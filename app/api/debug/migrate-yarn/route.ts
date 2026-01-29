
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const results: Record<string, number> = {};

        // Migrate Items
        const items = await prisma.itemMaster.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        results['ItemMaster'] = items.count;

        // Migrate POs
        const pos = await prisma.purchaseOrder.updateMany({
            where: { segment: 'GENERAL' }, // Only migrate unsegmented or general ones
            data: { segment: 'YARN' }
        });
        results['PurchaseOrder'] = pos.count;

        // Migrate GRNs
        const grns = await prisma.gRN.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        results['GRN'] = grns.count;

        // Migrate Invoices
        const invs = await prisma.purchaseInvoice.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        results['PurchaseInvoice'] = invs.count;

        // Migrate Returns
        const rets = await prisma.purchaseReturn.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        results['PurchaseReturn'] = rets.count;

        // Migrate Warehouses
        const whs = await prisma.warehouse.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        results['Warehouse'] = whs.count;

        // Migrate Accounts (Vendors/Customers)
        // Be careful: Might not want to migrate ALL generic accounts, but for now assuming single business.
        const accs = await prisma.account.updateMany({
            where: { segment: 'GENERAL' },
            data: { segment: 'YARN' }
        });
        results['Account'] = accs.count;

        return NextResponse.json({
            success: true,
            message: "Migrated data to YARN segment",
            counts: results
        });

    } catch (error) {
        return NextResponse.json({ error: "Migration failed", details: error }, { status: 500 });
    }
}
