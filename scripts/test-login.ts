
import 'dotenv/config';
import { login } from '@/controllers/authController';

async function main() {
    console.log('Testing login with admin@erp.com...');
    const result = await login('admin@erp.com', 'Admin@123');

    console.log('Login Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
