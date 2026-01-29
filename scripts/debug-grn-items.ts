
import 'dotenv/config';
import prisma from '../lib/prisma';

async function checkGRNItems() {
    console.log('--- Checking GRN Items ---');

    // Check GRNs in YARN segment
    const grns = await prisma.gRN.findMany({
        where: { segment: 'YARN' },
        include: { items: true }
    });

    console.log(`Found ${grns.length} YARN GRNs`);

    for (const grn of grns) {
        console.log(`GRN: ${grn.grnNumber} (ID: ${grn.id})`);
        console.log(`  Items: ${grn.items.length}`);
        grn.items.forEach(item => {
            console.log(`    - ItemId: ${item.itemMasterId}, Received: ${item.receivedQty}, Pcs: ${item.pcs}, Pkg: ${item.packingUnitId}`);
        });
    }

    if (grns.length === 0) {
        console.log('No YARN GRNs found. Checking for GENERAL...');
        const generalGrns = await prisma.gRN.findMany({
            where: { segment: 'GENERAL' },
            include: { items: true }
        });
        console.log(`Found ${generalGrns.length} GENERAL GRNs`);
    }

    await prisma.$disconnect();
}

checkGRNItems().catch(console.error);
