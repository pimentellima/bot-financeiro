import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConversationModule } from './conversation/conversation.module'
import { ConfigModule } from '@nestjs/config'
import { WebhookModule } from './webhook/webhook.module'

@Module({
    imports: [
        UsersModule,
        ConversationModule,
        WebhookModule,
        ConfigModule.forRoot({ isGlobal: true }),
    ],
})
export class AppModule {}
