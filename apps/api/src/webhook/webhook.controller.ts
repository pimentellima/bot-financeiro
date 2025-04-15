import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Query,
    Req,
    UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'
import { AiService } from '../ai/ai.service'
import { WhatsAppWebhookPayload } from 'src/whatsapp/whatsapp-webhook-payload.interface'
import { UsersService } from 'src/users/users.service'
import { getNumberFromWaId } from 'src/whatsapp/get-number-from-waid'
import { ChatService } from 'src/chat/chat.service'
import { appendResponseMessages, Message } from 'ai'

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly aiService: AiService,
        private readonly whatsappService: WhatsappService,
        private readonly chatService: ChatService,
        private readonly userService: UsersService
    ) {
        ConfigService
    }

    @Get()
    @HttpCode(201)
    async verifyRequest(
        @Query('hub.challenge') hubChallenge: string,
        @Query('hub.verify_token') hubVerificationToken: string
    ) {
        return await this.whatsappService.verifyToken(
            hubVerificationToken,
            hubChallenge
        )
    }

    @Post()
    @HttpCode(201)
    async respondMessage(@Body() data: WhatsAppWebhookPayload) {
        if (data.entry[0].changes[0]?.value.messages?.[0]?.type === 'text') {
            const waId = data.entry[0].changes[0].value.contacts?.[0].wa_id
            if (!waId) {
                throw new UnprocessableEntityException('Invalid waId')
            }
            const user = await this.userService.findOrCreateUserByWaId(waId)
            const message = getMessageFromPayload(data)

            const userMessages = (
                await this.chatService.findOrCreateChatByUserId(user.id)
            ).messages as Message[]

            const messageId = data.entry[0].changes[0].value.messages?.[0].id
            const age =
                Math.floor(Date.now() / 1000) -
                Number(data.entry[0].changes[0].value.messages?.[0].timestamp)
                
            if (
                userMessages.findIndex(
                    (message) => message.id === messageId
                ) !== -1 ||
                age > 60
            ) {
                return
            }

            const messages: Message[] = [
                ...userMessages.slice(-20),
                {
                    id: messageId || crypto.randomUUID(),
                    role: 'user',
                    content: message,
                },
            ]

            const aiResponse = await this.aiService.continueConversation(
                messages,
                user.id
            )

            await this.chatService.saveChat(
                appendResponseMessages({
                    messages,
                    responseMessages: aiResponse.response.messages,
                }),
                user.id
            )
            await this.whatsappService.sendMessage(
                getNumberFromWaId(waId),
                aiResponse.text
            )
        }
    }
}

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
