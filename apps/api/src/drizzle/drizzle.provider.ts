import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { DRIZZLE } from './drizzle.constants'

export const DrizzleProvider = {
    provide: DRIZZLE,
    useFactory: () => {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        })
        return drizzle(pool, { schema })
    },
}
