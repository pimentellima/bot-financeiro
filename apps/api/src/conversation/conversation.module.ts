import { Module } from '@nestjs/common'
import { ConversationController } from './conversation.controller'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'

@Module({
    controllers: [ConversationController],
    providers: [WhatsappService],
})
export class ConversationModule {}
