/**
 * Test Login Script
 * 
 * Tests the login functionality and password verification
 */

import prisma from './lib/prisma';
import { comparePassword } from './lib/password';

async function testLogin() {
    console.log('🔍 Testing login for admin@erp.com...\n');

    try {
        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { email: 'admin@erp.com' },
        });

        if (!user) {
            console.log('❌ User not found in database');
            console.log('💡 You need to seed the database first');
            return;
        }

        console.log('✅ User found:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   Password hash:', user.password.substring(0, 30) + '...');
        console.log('   Hash length:', user.password.length);

        // Test password
        const testPassword = 'Admin@123';
        console.log('\n🔐 Testing password:', testPassword);

        const isMatch = await comparePassword(testPassword, user.password);
        console.log('   Result:', isMatch ? '✅ Password MATCHES' : '❌ Password DOES NOT MATCH');

        if (!isMatch) {
            console.log('\n💡 Possible issues:');
            console.log('   1. The user was created with a different password');
            console.log('   2. The password hash algorithm mismatch');
            console.log('   3. The database was not seeded properly');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
