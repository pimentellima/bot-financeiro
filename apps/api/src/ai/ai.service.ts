import { OpenAIProvider } from '@ai-sdk/openai'
import { convertDate } from '@bot-financeiro/utils'
import { Inject, Injectable } from '@nestjs/common'
import { generateText, Message, tool } from 'ai'
import { eq, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE } from 'src/drizzle/drizzle.constants'
import { NotifyUserService } from 'src/notify-user/notify-user.service'
import { OPENAI } from 'src/openai/openai.constants'
import { z } from 'zod'
import * as schema from '../drizzle/schema'

@Injectable()
export class AiService {
    constructor(
        @Inject(OPENAI)
        private readonly openAi: OpenAIProvider,
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly notifyUser: NotifyUserService
    ) {}

    async continueConversation(messages: Message[], userId: number) {
        const generateQueryTool = tool({
            description:
                "Generate a postgreSQL compatible query to get information from the database based on the user's question",
            parameters: z.object({
                query: z
                    .string()
                    .describe(
                        `The user question. Current date is: ${new Date()}`
                    ),
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
                const result = await this.db
                    .delete(schema.statements)
                    .where(eq(schema.statements.id, id))
                if (result.rowCount === 0) {
                    return `❌ Extrato com ID ${id} não encontrado.`
                }
                return `✅ Extrato com ID ${id} deletado com sucesso.`
            },
        })

        const createStatementTool = tool({
            description:
                'Create a financial statement from provided information.',
            parameters: z.object({
                description: z.string().min(1),
                amount: z.number().transform((val) => val.toString()),
                type: z.enum(['income', 'expense']),
                date: z.coerce
                    .date()
                    .describe(`Current date is: ${new Date()}`)
                    .optional()
                    .transform((val) => (val ? convertDate(val) : undefined)),
            }),
            execute: async ({ description, amount, date, type }) => {
                await this.db.insert(schema.statements).values({
                    userId,
                    amount,
                    description,
                    date,
                    type
                })

                return `✅ Extrato criado: "${description}" of $${amount}`
            },
        })

        const queryDatabaseTool = tool({
            description: 'Query the database with a given query.',
            parameters: z.object({
                query: z.string(),
            }),
            execute: async ({ query }) => {
                try {
                    const result = await this.db.execute(sql.raw(query))
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
                await this.notifyUser.scheduleReminderForUser(
                    userId,
                    date,
                    description
                )

                return 'Lembre criado'
            },
        })

        return await generateText({
            model: this.openAi('gpt-4o-2024-05-13'),
            messages,
            system,
            maxSteps: 5,
            tools: {
                createReminder: createReminderTool,
                generateQuery: generateQueryTool,
                queryDatabase: queryDatabaseTool,
                createStatement: createStatementTool,
                deleteStatement: deleteStatementTool,
            },
        })
    }
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
            amount NUMERIC(10, 2),
            type statement_type NOT NULL DEFAULT 'expense',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        ------
        If the user asks about financial information, only respond to questions using information from tool calls.
        If the user asks to schedule a reminder, use the createReminder tool.
        If the user asks to create a financial statement, use the createStatement tool. Do not need to ask for confirmation.
        If the user asks to query the database, use the generateQuery tool to create a query and then use the queryDatabase tool to execute it.

        When you use the ILIKE operator, convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(description) ILIKE LOWER('%search_term%').
        You will respond based on information retrieved from the database.

        If the user asks to delete a financial statement, first, use query the database to get the ID based on the descripton the user
        gave. Ask for more if needed. Then, use the deleteStatement tool. Always ask for confirmation before deleting.
        
        Respond in ptBR.`
