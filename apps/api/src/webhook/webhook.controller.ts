import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Query,
    Req,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'
import { OpenAIService } from '../openai/openai.service'
import { WhatsAppWebhookPayload } from 'src/whatsapp/whatsapp-webhook-payload.interface'

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly openAIService: OpenAIService,
        private readonly metaService: WhatsappService
    ) {
        ConfigService
    }

    @Get()
    @HttpCode(201)
    async verifyRequest(
        @Query('hub.challenge') hubChallenge: string,
        @Query('hub.verify_token') hubVerificationToken: string
    ) {
        return await this.metaService.verifyToken(
            hubVerificationToken,
            hubChallenge
        )
    }

    @Post()
    @HttpCode(201)
    async respondMessage(@Body() data: WhatsAppWebhookPayload) {
        if (data.entry[0].changes[0]?.value.messages?.[0]?.type === 'text') {
            const message = getMessageFromPayload(data)
            const aiResponse = await this.openAIService.generateResponse(
                message
            )
            await this.metaService.sendMessage(aiResponse)
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
