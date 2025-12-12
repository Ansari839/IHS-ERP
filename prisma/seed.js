/**
 * Database Seed Script
 * 
 * Creates initial users including super admin for the ERP system.
 * Run: node prisma/seed.js
 */

const { PrismaClient } = require('../app/generated/prisma/index.js');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const testPassword = await bcrypt.hash('password123', 12);

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@erp.com' },
        update: {
            password: adminPassword,
            role: 'SUPER_ADMIN',
        },
        create: {
            email: 'admin@erp.com',
            name: 'Super Admin',
            password: adminPassword,
            role: 'SUPER_ADMIN',
        },
    });

    console.log('✅ Created Super Admin:');
    console.log('   ID:', superAdmin.id);
    console.log('   Email:', superAdmin.email);
    console.log('   Name:', superAdmin.name);
    console.log('   Role:', superAdmin.role);

    // Create Test User
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {
            password: testPassword,
            role: 'USER',
        },
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: testPassword,
            role: 'USER',
        },
    });

    console.log('\n✅ Created Test User:');
    console.log('   ID:', testUser.id);
    console.log('   Email:', testUser.email);
    console.log('   Name:', testUser.name);
    console.log('   Role:', testUser.role);

    console.log('\n' + '='.repeat(50));
    console.log('📋 LOGIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('\n🔐 Super Admin:');
    console.log('   Email:    admin@erp.com');
    console.log('   Password: Admin@123');
    console.log('\n👤 Test User:');
    console.log('   Email:    test@example.com');
    console.log('   Password: password123');
    console.log('\n' + '='.repeat(50));
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
