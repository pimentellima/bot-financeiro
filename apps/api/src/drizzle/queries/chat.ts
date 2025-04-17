import { Message } from 'ai'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../schema'

export async function updateChatMessages(
    db: NodePgDatabase<typeof schema>,
    userId: number,
    messages: Message[]
) {
    await db
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
