/**
 * Database Connection Test
 * 
 * Tests if the DATABASE_URL is properly configured
 */

import prisma from './lib/prisma';

async function testConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Try to connect to the database
        await prisma.$connect();
        console.log('✅ Database connection successful!\n');

        // Try a simple query
        const userCount = await prisma.user.count();
        console.log(`📊 Database Stats:`);
        console.log(`   Total users: ${userCount}`);

        if (userCount === 0) {
            console.log('\n⚠️  No users found in database');
            console.log('💡 Run the seed script to create initial users:');
            console.log('   npm run db:seed\n');
        } else {
            // Show existing users
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });

            console.log('\n👥 Existing users:');
            users.forEach(user => {
                console.log(`   - ${user.email} (${user.role})`);
            });
        }

    } catch (error) {
        console.log('❌ Database connection failed!\n');

        if (error instanceof Error) {
            console.log('Error:', error.message);

            if (error.message.includes('SASL') || error.message.includes('password')) {
                console.log('\n💡 This error usually means:');
                console.log('   1. DATABASE_URL is malformed');
                console.log('   2. Password is missing or incorrect');
                console.log('   3. Password contains special characters that need URL encoding');
                console.log('\n📖 Check DATABASE_SETUP.md for detailed instructions');
            } else if (error.message.includes('ECONNREFUSED')) {
                console.log('\n💡 This error usually means:');
                console.log('   1. PostgreSQL is not running');
                console.log('   2. Wrong host or port in DATABASE_URL');
                console.log('   3. Firewall blocking the connection');
            } else if (error.message.includes('database') && error.message.includes('does not exist')) {
                console.log('\n💡 Create the database first:');
                console.log('   createdb erp_db');
            }
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
