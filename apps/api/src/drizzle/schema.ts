import {
    boolean,
    date,
    numeric,
    pgTable,
    serial,
    text,
    varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name'),
    waId: text('wa_id').unique(),
    email: text('email'),
    emailVerified: boolean('email_verified').default(false),
})

export const statements = pgTable('statements', {
    id: serial('id').primaryKey(),
    userId: serial('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    description: text('description'),
    date: date('date'),
    amount: numeric('amount', { precision: 10, scale: 2 }),
    createdAt: text('created_at').default('now()'),
})
