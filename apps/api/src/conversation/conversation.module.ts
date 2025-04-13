import { Module } from '@nestjs/common'
import { NotifyUserModule } from 'src/notify-user/notify-user.module'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'
import { ConversationController } from './conversation.controller'

@Module({
    imports: [NotifyUserModule],
    controllers: [ConversationController],
    providers: [WhatsappService],
})
export class ConversationModule {}
