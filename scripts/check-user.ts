
import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Checking user admin@erp.com...');
    const user = await prisma.user.findUnique({
        where: { email: 'admin@erp.com' },
    });

    if (!user) {
        console.log('❌ User not found!');
        return;
    }

    console.log('✅ User found:', user.email);
    console.log('   ID:', user.id);
    console.log('   Role:', user.role);
    console.log('   Password Hash:', user.password.substring(0, 10) + '...');

    const password = 'Admin@123';
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        console.log('✅ Password match successful!');
    } else {
        console.log('❌ Password match FAILED!');

        // Try to hash it again and see
        const newHash = await bcrypt.hash(password, 12);
        console.log('   New Hash would be:', newHash.substring(0, 10) + '...');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
