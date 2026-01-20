import prisma from './lib/prisma.js';

async function main() {
    try {
        if ((prisma as any).brand) {
            console.log("✅ prisma.brand exists!");
            const count = await prisma.brand.count();
            console.log(`📊 Current brands count: ${count}`);
        } else {
            console.error("❌ prisma.brand is UNDEFINED in test script");
        }
    } catch (err) {
        console.error('Test script error:', err);
    }
}

main();
