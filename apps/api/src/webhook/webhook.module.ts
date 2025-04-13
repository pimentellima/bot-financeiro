import { Module } from '@nestjs/common'
import { AiToolsModule } from 'src/ai-tools/ai-tools.module'
import { UsersModule } from 'src/users/users.module'
import { WhatsappModule } from 'src/whatsapp/whatsapp.module'
import { WebhookController } from './webhook.controller'

@Module({
    imports: [AiToolsModule, WhatsappModule, UsersModule],
    controllers: [WebhookController],
})
export class WebhookModule {}
