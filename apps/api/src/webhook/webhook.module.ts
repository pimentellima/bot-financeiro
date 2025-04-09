import { Module } from '@nestjs/common'
import { OpenAIService } from 'src/openai/openai.service'
import { WebhookController } from './webhook.controller'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'

@Module({
    controllers: [WebhookController],
    providers: [OpenAIService, WhatsappService],
})
export class WebhookModule {}
