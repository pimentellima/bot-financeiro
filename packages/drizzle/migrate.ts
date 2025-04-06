import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { database } from './index'; // usa o index.ts que conecta ao banco

async function main() {
  try {
    console.log('🚀 Running migrations...');
    await migrate(database, { migrationsFolder: './migrations' });
    console.log('✅ Migrations complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

main();