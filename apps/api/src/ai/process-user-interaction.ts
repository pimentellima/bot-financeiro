import { OpenAIProvider } from '@ai-sdk/openai'
import { convertDate } from '@bot-financeiro/utils'
import { generateText, Message, tool } from 'ai'
import { eq, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { notifyUserTask } from 'src/trigger/notify-user'
import { z } from 'zod'
import * as schema from '../drizzle/schema'

export async function processUserInteraction(
    messages: Message[],
    userId: number,
    userNumber: string,
    db: NodePgDatabase<typeof schema>,
    openAi: OpenAIProvider
) {
    const generateQueryTool = tool({
        description:
            "Generate a postgreSQL compatible query to get information from the database based on the user's question",
        parameters: z.object({
            query: z
                .string()
                .describe(`The user question. Current date is: ${new Date()}`),
        }),
        execute: async ({ query }) => {
            return { query }
        },
    })

    const deleteStatementTool = tool({
        description:
            'Delete a financial statement from the database based on the provided ID.',
        parameters: z.object({
            id: z.number().int().positive(),
        }),
        execute: async ({ id }) => {
            const result = await db
                .delete(schema.statements)
                .where(eq(schema.statements.id, id))
            if (result.rowCount === 0) {
                return `❌ Extrato não encontrado.`
            }
            return `✅ Extrato deletado com sucesso.`
        },
    })

    const createStatementTool = tool({
        description: 'Create a financial statement from provided information.',
        parameters: z.object({
            description: z.string().min(1),
            amount: z.number().transform((val) => val.toString()),
            type: z.enum(['income', 'expense']),
            paid: z
                .boolean()
                .default(true)
                .describe(
                    `Paid status. True for confirmed payments, false for pending payments.`
                ),
            date: z.coerce
                .date()
                .describe(`Current date is: ${new Date()}`)
                .optional()
                .transform((val) => (val ? convertDate(val) : undefined)),
        }),
        execute: async ({ description, amount, date, type, paid }) => {
            await db.insert(schema.statements).values({
                userId,
                amount,
                description,
                date,
                type,
                paid,
            })

            return `✅ Extrato criado: "${description}" of $${amount}`
        },
    })

    const updateStatementTool = tool({
        description: 'Update a financial statement from provided information.',
        parameters: z.object({
            id: z.number().int().positive(),
            description: z.string().min(1),
            amount: z.number().transform((val) => val.toString()),
            type: z.enum(['income', 'expense']),
            paid: z
                .boolean()
                .default(true)
                .describe(
                    `Paid status. True for confirmed payments, false for pending payments.`
                ),
            date: z.coerce
                .date()
                .describe(`Current date is: ${new Date()}`)
                .optional()
                .transform((val) => (val ? convertDate(val) : undefined)),
        }),
        execute: async ({ id, description, amount, date, type, paid }) => {
            const result = await db
                .update(schema.statements)
                .set({
                    description,
                    amount,
                    date,
                    type,
                    paid,
                })
                .where(eq(schema.statements.id, id))
            if (result.rowCount === 0) {
                return `❌ Extrato encontrado.`
            }
            return `✅ Extrato atualizado com sucesso.`
        },
    })

    const queryDatabaseTool = tool({
        description: 'Query the database with a given query.',
        parameters: z.object({
            query: z.string(),
        }),
        execute: async ({ query }) => {
            try {
                const result = await db.execute(sql.raw(query))
                return { result: result.rows }
            } catch (error) {
                return { error }
            }
        },
    })

    const createReminderTool = tool({
        description:
            'Create a reminder for the user with a given description and date.',
        parameters: z.object({
            description: z.string().min(1),
            date: z.coerce
                .date()
                .describe(
                    `The date of the reminder. Current date is: ${new Date()}`
                ),
        }),
        execute: async ({ description, date }) => {
            notifyUserTask.trigger(
                {
                    message: `Lembrete: ${description}`,
                    number: userNumber,
                },
                { concurrencyKey: `${userId}-reminder`, delay: date }
            )

            return 'Lembre criado'
        },
    })

    return await generateText({
        model: openAi('gpt-4o-mini-2024-07-18'),
        messages: messages.map((m) => ({ content: m.content, role: m.role })),
        system,
        maxSteps: 5,
        tools: {
            createReminder: createReminderTool,
            generateQuery: generateQueryTool,
            queryDatabase: queryDatabaseTool,
            createStatement: createStatementTool,
            deleteStatement: deleteStatementTool,
            updateStatement: updateStatementTool,
        },
    })
}

const system = `You are a helpful financial assistant. Use the tools provided to answer questions. If needed, you will
        query the database to get the information or insert records.
        Here's the schema: 
        -------
        CREATE TYPE statement_type AS ENUM ('income', 'expense');

        CREATE TABLE statements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            description TEXT,
            date DATE,
            due_date DATE,
            amount NUMERIC(10, 2),
            type statement_type NOT NULL DEFAULT 'expense',
            paid BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        ------
        Each statement represents either an income or an expense, and contains the following fields:

        - description: A short text describing the statement.
        - date: The date when the statement was created or recorded.
        - due_date: The date by which the statement should be paid or received. Useful for future-dated entries like reminders.
        - amount: The monetary value of the statement.
        - type: Can be either 'income' or 'expense'. Use 'income' when the user is expecting to receive money, and 'expense' when the user is paying or spending.
        - paid: A boolean value indicating whether the statement has already been paid (for expenses) or received (for incomes). Use false for future entries or reminders, and true for already completed ones.

        When the user asks to save something like "someone owes me money until day X", you should create a statement with:
        - due_date set to day X,
        - paid set to false,
        - type set to 'income'.

        This represents a future income that hasn't been received yet.

        If the user asks about financial information, only respond to questions using information from tool calls.
        If the user asks to schedule a reminder, use the createReminder tool.
        If the user asks to create a financial statement, use the createStatement tool. Do not need to ask for confirmation.
        If the user asks to query the database, use the generateQuery tool to create a query and then use the queryDatabase tool to execute it.

        When you use the ILIKE operator, convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(description) ILIKE LOWER('%search_term%').
        You will respond based on information retrieved from the database.

        If the user asks to update or to delete a financial statement, first, use query the database to get the ID based on the descripton the user
        gave. Ask for more if needed. Then, use the updateStament or the deleteStatement tool.
        
        Respond in ptBR.`
