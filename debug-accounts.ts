
import { PrismaClient } from './app/generated/prisma/client';
const prisma = new PrismaClient();
async function main() {
    const accounts = await prisma.account.findMany({
        select: { id: true, name: true, code: true, type: true }
    });
    console.log(JSON.stringify(accounts, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
