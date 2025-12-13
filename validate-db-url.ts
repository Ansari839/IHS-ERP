/**
 * DATABASE_URL Validator
 * 
 * Validates and diagnoses DATABASE_URL configuration
 */

console.log('🔍 DATABASE_URL Validation\n');
console.log('='.repeat(60));

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.log('❌ DATABASE_URL is not set!\n');
    console.log('💡 Add DATABASE_URL to your .env file:');
    console.log('   DATABASE_URL="postgresql://user:password@host:5432/database"\n');
    process.exit(1);
}

console.log('✅ DATABASE_URL is set\n');

// Parse the URL
try {
    const url = new URL(dbUrl);

    console.log('📋 Parsed Components:');
    console.log('   Protocol:', url.protocol);
    console.log('   Username:', url.username || '(missing)');
    console.log('   Password:', url.password ? '***' + url.password.slice(-2) : '(missing)');
    console.log('   Hostname:', url.hostname || '(missing)');
    console.log('   Port:', url.port || '(using default)');
    console.log('   Database:', url.pathname.slice(1) || '(missing)');
    console.log('');

    // Validation checks
    const issues: string[] = [];

    if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        issues.push('Protocol must be "postgresql:" or "postgres:"');
    }

    if (!url.username) {
        issues.push('Username is missing');
    }

    if (!url.password) {
        issues.push('❌ PASSWORD IS MISSING - This is likely your issue!');
    }

    if (!url.hostname) {
        issues.push('Hostname is missing');
    }

    if (!url.pathname || url.pathname === '/') {
        issues.push('Database name is missing');
    }

    if (issues.length > 0) {
        console.log('❌ Issues Found:\n');
        issues.forEach((issue, i) => {
            console.log(`   ${i + 1}. ${issue}`);
        });
        console.log('\n💡 Correct format:');
        console.log('   DATABASE_URL="postgresql://username:password@host:5432/database"');
        console.log('\n📖 See QUICK_FIX.md for examples\n');
    } else {
        console.log('✅ DATABASE_URL format looks correct!\n');
        console.log('💡 Next steps:');
        console.log('   1. Verify PostgreSQL is running');
        console.log('   2. Test connection: npm run db:test');
        console.log('   3. Seed database: npm run db:seed\n');
    }

} catch (error) {
    console.log('❌ Failed to parse DATABASE_URL\n');
    console.log('Current value (masked):');
    const masked = dbUrl.replace(/:[^:@]+@/, ':***@');
    console.log('  ', masked);
    console.log('\n💡 Correct format:');
    console.log('   DATABASE_URL="postgresql://username:password@host:5432/database"\n');

    if (error instanceof Error) {
        console.log('Parse error:', error.message);
    }
}

console.log('='.repeat(60));
