/**
 * Database Seed Script
 * 
 * Creates initial permissions, roles, departments, and users.
 * Run: npx tsx prisma/seed.ts
 */

import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...\n');

    // 1. Create Departments
    const deptIT = await prisma.department.upsert({
        where: { name: 'IT' },
        update: {},
        create: { name: 'IT', description: 'Information Technology' },
    });

    const deptSales = await prisma.department.upsert({
        where: { name: 'Sales' },
        update: {},
        create: { name: 'Sales', description: 'Sales and Marketing' },
    });

    console.log('✅ Departments created');

    // 2. Create Permissions
    const resources = ['users', 'products', 'orders', 'reports', 'settings', 'audit_logs'];
    const actions = ['create', 'read', 'update', 'delete'];

    const permissionsMap = new Map();

    for (const resource of resources) {
        for (const action of actions) {
            const perm = await prisma.permission.upsert({
                where: {
                    action_resource: {
                        action,
                        resource,
                    },
                },
                update: {},
                create: {
                    action,
                    resource,
                    description: `Can ${action} ${resource}`,
                },
            });
            permissionsMap.set(`${action}:${resource}`, perm.id);
        }
    }

    console.log('✅ Permissions created');

    // 3. Create Roles
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: { name: 'SUPER_ADMIN', description: 'Full system access' },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'Department administrator' },
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER', description: 'Standard user' },
    });

    console.log('✅ Roles created');

    // 4. Assign Permissions to Roles

    // Super Admin gets ALL permissions
    const allPermissions = await prisma.permission.findMany();
    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                permissionId: perm.id,
            },
        });
    }

    // User gets read and update permissions (for testing CRUD)
    const userPermissions = allPermissions.filter(p => p.action === 'read' || p.action === 'update');
    for (const perm of userPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: userRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: userRole.id,
                permissionId: perm.id,
            },
        });
    }

    console.log('✅ Permissions assigned to roles');

    // 5. Create Users
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const testPassword = await bcrypt.hash('password123', 12);

    // Super Admin User
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@erp.com' },
        update: {
            password: adminPassword,
            departmentId: deptIT.id,
        },
        create: {
            email: 'admin@erp.com',
            name: 'Super Admin',
            password: adminPassword,
            departmentId: deptIT.id,
        },
    });

    // Assign Super Admin Role
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: superAdmin.id,
                roleId: superAdminRole.id,
            },
        },
        update: {},
        create: {
            userId: superAdmin.id,
            roleId: superAdminRole.id,
        },
    });

    // Test User
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {
            password: testPassword,
            departmentId: deptSales.id,
        },
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: testPassword,
            departmentId: deptSales.id,
        },
    });

    // Assign User Role
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: testUser.id,
                roleId: userRole.id,
            },
        },
        update: {},
        create: {
            userId: testUser.id,
            roleId: userRole.id,
        },
    });

    console.log('\n' + '='.repeat(50));
    console.log('📋 LOGIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('\n🔐 Super Admin:');
    console.log('   Email:    admin@erp.com');
    console.log('   Password: Admin@123');
    console.log('   Role:     SUPER_ADMIN');
    console.log('\n👤 Test User:');
    console.log('   Email:    test@example.com');
    console.log('   Password: password123');
    console.log('   Role:     USER');
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