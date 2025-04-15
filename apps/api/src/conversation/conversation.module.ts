import { Module } from '@nestjs/common'
import { NotifyUserModule } from 'src/notify-user/notify-user.module'
import { WhatsappModule } from 'src/whatsapp/whatsapp.module'
import { ConversationController } from './conversation.controller'

@Module({
    imports: [NotifyUserModule, WhatsappModule],
    controllers: [ConversationController],
})
export class ConversationModule {}
