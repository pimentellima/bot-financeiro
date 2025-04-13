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
import { AiToolsService } from '../ai-tools/ai-tools.service'
import { WhatsAppWebhookPayload } from 'src/whatsapp/whatsapp-webhook-payload.interface'
import { UsersService } from 'src/users/users.service'
import { getNumberFromWaId } from 'src/whatsapp/get-number-from-waid'

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly aiToolsService: AiToolsService,
        private readonly whatsappService: WhatsappService,
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

            const userMessage = getMessageFromPayload(data)
            const aiResponse = await this.aiToolsService.processUserMessage(
                userMessage,
                user.id
            )
            await this.whatsappService.sendMessage(
                getNumberFromWaId(waId),
                aiResponse
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
