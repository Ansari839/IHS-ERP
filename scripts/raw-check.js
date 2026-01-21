
const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        const res = await client.query(`
            SELECT table_schema, table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name ILIKE 'PurchaseOrderItem'
            ORDER BY table_name, column_name;
        `);

        console.log('Columns found:');
        res.rows.forEach(row => {
            console.log(`- ${row.table_schema}.${row.table_name} : ${row.column_name} (${row.data_type})`);
        });

        const tables = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('\nAll public tables:');
        tables.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
