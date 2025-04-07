import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const database = drizzle(pool)

async function main() {
    try {
        console.log('🚀 Running migrations...')
        await migrate(database, { migrationsFolder: './migrations' })
        console.log('✅ Migrations complete!')
        process.exit(0)
    } catch (err) {
        console.error('❌ Migration failed:', err)
        process.exit(1)
    }
}

main()
