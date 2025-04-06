import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import 'dotenv/config' 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const database = drizzle(pool, { schema })

export * from './schema'
