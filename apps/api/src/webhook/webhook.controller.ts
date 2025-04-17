import {
    Body,
    Controller,
    Get,
    HttpCode,
    InternalServerErrorException,
    Post,
    Query,
    UnprocessableEntityException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Message } from 'ai'
import { ChatService } from 'src/chat/chat.service'
import { userInteractionTask } from 'src/trigger/user-interaction'
import { UsersService } from 'src/users/users.service'
import { getNumberFromWaId } from 'src/whatsapp/get-number-from-waid'
import { WhatsAppWebhookPayload } from 'src/whatsapp/whatsapp-webhook-payload.interface'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'

@Controller('webhook')
export class WebhookController {
    constructor(
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
    @HttpCode(200)
    async triggerInteractionTask(@Body() payload: WhatsAppWebhookPayload) {
        const waId = payload.entry[0].changes[0].value.contacts?.[0].wa_id
        if (!waId) {
            throw new UnprocessableEntityException('Invalid waID')
        }

        const user = await this.userService.findOrCreateUserByWaId(waId)
        if (!user) {
            throw new InternalServerErrorException('Error finding or creating user')
        }

        const chat = await this.chatService.findOrCreateChatByUserId(user.id)
        const userMessages = chat.messages as Message[]
        const messageId = payload.entry[0].changes[0].value.messages?.[0].id
        const age =
            Math.floor(Date.now() / 1000) -
            Number(payload.entry[0].changes[0].value.messages?.[0].timestamp)
        if (
            userMessages.findIndex((message) => message.id === messageId) !==
                -1 ||
            age > 60
        ) {
            return
        }

        const number = getNumberFromWaId(waId)
        let textMessage: string | undefined
        let audioArrayBuffer: ArrayBuffer | undefined
        const messageType =
            payload.entry[0].changes[0]?.value.messages?.[0]?.type
        if (messageType === 'text') {
            textMessage =
                payload.entry[0].changes[0].value.messages?.[0].text?.body
        } else if (messageType === 'audio') {
            const mediaId =
                payload.entry[0].changes[0].value.messages?.[0].audio?.id
            if (!mediaId) {
                throw new UnprocessableEntityException('No mediaId found')
            }
            const media = await this.whatsappService.getMediaMetadata(mediaId)
            audioArrayBuffer = await this.whatsappService.getMediaBufferByUrl(
                media.url
            )
        } else {
            await this.whatsappService.sendMessage(
                number,
                'Não suportamos esse tipo de mensagem.'
            )
            return
        }

        userInteractionTask.trigger(
            {
                messageId: messageId || crypto.randomUUID(),
                userId: user.id,
                userNumber: number,
                audioBuffer: audioArrayBuffer
                    ? Buffer.from(audioArrayBuffer)
                    : undefined,
                messageType,
                textMessage,
                userMessages,
            },
            { concurrencyKey: `${user.id}-interaction` }
        )
    }
}
