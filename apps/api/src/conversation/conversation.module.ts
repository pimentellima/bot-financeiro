import { Module } from '@nestjs/common'
import { WhatsappModule } from 'src/whatsapp/whatsapp.module'
import { ConversationController } from './conversation.controller'

@Module({
    imports: [WhatsappModule],
    controllers: [ConversationController],
})
export class ConversationModule {}
