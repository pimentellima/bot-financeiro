import { Module } from '@nestjs/common'
import { OpenAIService } from 'src/openai/openai.service'
import { WebhookController } from './webhook.controller'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'
import { DrizzleModule } from 'src/drizzle/drizzle.module'
import { UsersService } from 'src/users/users.service'

@Module({
    imports: [DrizzleModule],
    controllers: [WebhookController],
    providers: [OpenAIService, WhatsappService, UsersService],
})
export class WebhookModule {}
