import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './schema.ts',
    dialect: 'postgresql',
    out: './migrations',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
})
