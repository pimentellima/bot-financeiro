import { OpenAIProvider } from '@ai-sdk/openai'
import { convertDate } from '@bot-financeiro/utils'
import { Inject, Injectable } from '@nestjs/common'
import { generateText, tool } from 'ai'
import { sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE } from 'src/drizzle/drizzle.constants'
import { NotifyUserService } from 'src/notify-user/notify-user.service'
import { OPENAI } from 'src/openai/openai.constants'
import { z } from 'zod'
import * as schema from '../drizzle/schema'

@Injectable()
export class AiToolsService {
    constructor(
        @Inject(OPENAI)
        private readonly openAi: OpenAIProvider,
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>,
        private readonly notifyUser: NotifyUserService
    ) {}

    async processUserMessage(message: string, userId: number): Promise<string> {
        const generateQueryTool = tool({
            description:
                "Generate a postgreSQL compatible query to get information from the database based on the user's question",
            parameters: z.object({
                query: z.string(),
            }),
            execute: async ({ query }) => {
                return { query }
            },
        })

        const createStatementTool = tool({
            description:
                'Create a financial statement from provided information.',
            parameters: z.object({
                description: z.string().min(1),
                amount: z.number().transform((val) => val.toString()),
                date: z.coerce
                    .date()
                    .optional()
                    .transform((val) => (val ? convertDate(val) : undefined)),
            }),
            execute: async ({ description, amount, date }) => {
                await this.db.insert(schema.statements).values({
                    userId,
                    amount,
                    description,
                    date,
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
                    console.log(error)
                    return { error }
                }
            },
        })

        const createReminderTool = tool({
            description:
                'Create a reminder for the user with a given description and date.',
            parameters: z.object({
                description: z.string().min(1),
                date: z.date(),
            }),
            execute: async ({ description, date }) => {
                await this.notifyUser.scheduleReminderForUser(
                    userId,
                    date,
                    description
                )
            },
        })

        const { text } = await generateText({
            model: this.openAi('gpt-4o-2024-05-13'),
            messages: [{ content: message, role: 'user' }],
            system,
            maxSteps: 7,
            tools: {
                generateQuery: generateQueryTool,
                queryDatabase: queryDatabaseTool,
                createStatement: createStatementTool,
            },
        })

        return text
    }
}

const system = `You are a helpful financial assistant. Use the tools provided to answer questions. If needed, you will
        query the database to get the information or insert records.
        Here's the statements table: 
        CREATE TABLE statements (
            id SERIAL PRIMARY KEY,
            user_id SERIAL NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            description TEXT,
            date DATE,
            amount NUMERIC(10, 2),
            created_at TEXT DEFAULT 'now()'
        );
        Only respond to questions using information from tool calls.

        When you use the ILIKE operator, convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(description) ILIKE LOWER('%search_term%').
        You will respond based on information retrieved from the database.
        
        Respond in ptBR.`
