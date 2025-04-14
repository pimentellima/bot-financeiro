import { Module } from '@nestjs/common'
import { AiModule } from 'src/ai/ai.module'
import { UsersModule } from 'src/users/users.module'
import { WhatsappModule } from 'src/whatsapp/whatsapp.module'
import { WebhookController } from './webhook.controller'
import { ChatModule } from 'src/chat/chat.module'

@Module({
    imports: [AiModule, WhatsappModule, UsersModule, ChatModule],
    controllers: [WebhookController],
})
export class WebhookModule {}
