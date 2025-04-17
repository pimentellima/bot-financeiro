import { createOpenAI } from '@ai-sdk/openai'
import { logger, task } from '@trigger.dev/sdk/v3'
import { appendResponseMessages, Message } from 'ai'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { processUserInteraction } from 'src/ai/process-user-interaction'
import { transcribeAudio } from 'src/ai/transcribe-audio'
import { updateChatMessages } from 'src/drizzle/queries/chat'
import { EnvironmentEnums } from 'src/enums/environment.enums'
import { sendMessageToWhatsapp } from 'src/utils/send-message-to-whatsapp'
import { WhatsAppWebhookPayload } from 'src/whatsapp/whatsapp-webhook-payload.interface'
import * as schema from '../drizzle/schema'

interface UserInteractionPayload {
    textMessage?: string
    audioBuffer?: Buffer
    messageType?: 'audio' | 'text'
    userMessages: Message[]
    messageId: string
    userId: number
    userNumber: string
}

export const userInteractionTask = task({
    id: 'process-user-interaction',
    maxDuration: 300,
    run: async ({
        audioBuffer,
        messageType,
        textMessage,
        userMessages,
        userId,
        messageId,
        userNumber,
    }: UserInteractionPayload) => {
        const whatsappApiToken =
            process.env[EnvironmentEnums.WHATSAPP_API_TOKEN]
        const whatsappNumberId =
            process.env[EnvironmentEnums.WHATSAPP_NUMBER_ID]
        const openAi = createOpenAI({
            apiKey: process.env[EnvironmentEnums.OPENAI_API_KEY],
        })
        logger.log('Processing task')
        const pool = new Pool({
            connectionString: process.env[EnvironmentEnums.DATABASE_URL],
        })
        const db = drizzle(pool, { schema })

        let message = textMessage || ''
        if (messageType === 'audio' && audioBuffer) {
            message = await transcribeAudio(audioBuffer, openAi)
        }
        logger.info(`message: ${message}`)

        const messages: Message[] = [
            ...userMessages.slice(-20),
            {
                id: messageId,
                role: 'user',
                content: message,
            },
        ]

        const aiResponse = await processUserInteraction(
            messages,
            userId,
            userNumber,
            db,
            openAi
        )

        await updateChatMessages(
            db,
            userId,
            appendResponseMessages({
                messages,
                responseMessages: aiResponse.response.messages,
            })
        )

        await sendMessageToWhatsapp(
            whatsappApiToken!,
            whatsappNumberId!,
            userNumber,
            aiResponse.text
        )
    },
})

function getMessageFromPayload(payload: WhatsAppWebhookPayload): string {
    const entries = payload.entry
    let messageBody = ''
    for (const entry of entries) {
        for (const change of entry.changes) {
            const value = change.value
            if (value) {
                if (value.messages) {
                    for (const message of value.messages) {
                        if (message.type === 'text') {
                            messageBody = message?.text?.body || 'No message'
                        }
                    }
                }
            }
        }
    }
    return messageBody
}
