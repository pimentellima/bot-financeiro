import { Module } from '@nestjs/common'
import { DrizzleModule } from 'src/drizzle/drizzle.module'
import { ChatService } from './chat.service'

@Module({
    imports: [DrizzleModule],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule {}
