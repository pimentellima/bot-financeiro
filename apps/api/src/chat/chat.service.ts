import { Inject, Injectable } from '@nestjs/common'
import { desc, eq, InferInsertModel } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE } from 'src/drizzle/drizzle.constants'
import * as schema from '../drizzle/schema'
import { CoreMessage, Message } from 'ai'

@Injectable()
export class ChatService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>
    ) {}

    async findOrCreateChatByUserId(userId: number) {
        const [chat] = await this.db
            .select()
            .from(schema.chats)
            .where(eq(schema.chats.userId, userId))

        if (!chat) {
            const [chat] = await this.db
                .insert(schema.chats)
                .values({ userId, messages: '[]' })
                .returning()
            return chat
        }

        return chat
    }

    async saveChat(messages: Message[], userId: number) {
        await this.db
            .insert(schema.chats)
            .values({
                messages: JSON.stringify(messages),
                userId,
            })
            .onConflictDoUpdate({
                target: schema.chats.userId,
                set: {
                    messages: JSON.stringify(messages),
                    updatedAt: new Date(),
                },
            })
    }
}
