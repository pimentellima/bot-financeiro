import {
    boolean,
    date,
    integer,
    json,
    numeric,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name'),
    waId: text('wa_id').unique(),
    email: text('email'),
    emailVerified: boolean('email_verified').default(false),
})

export const statementTypeEnum = pgEnum('statement_type', ['income', 'expense'])

export const statements = pgTable('statements', {
    id: serial('id').primaryKey(),
    userId: serial('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    description: text('description'),
    date: date('date'),
    amount: numeric('amount', { precision: 10, scale: 2 }),
    type: statementTypeEnum('type').notNull().default('expense'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    messages: json('messages').notNull(),
    userId: integer('userId')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),
})
