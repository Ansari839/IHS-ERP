import { PrismaClient } from '../app/generated/prisma';

async function check() {
    const prisma = new PrismaClient();
    try {
        const items = await prisma.itemMaster.findMany({
            include: {
                packingUnit: true,
                baseUnit: true
            }
        });

        console.log('--- Item Master Packing Units ---');
        items.forEach(item => {
            console.log(`Item: ${item.name}`);
            console.log(`  Code: ${item.code}`);
            console.log(`  Base Unit: ${item.baseUnit?.symbol || 'N/A'}`);
            console.log(`  Packing Unit: ${item.packingUnit?.name || 'NONE'} (${item.packingUnit?.symbol || 'NONE'})`);
            console.log(`  Packing Unit ID: ${item.packingUnitId || 'NULL'}`);
            console.log('----------------------------');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
