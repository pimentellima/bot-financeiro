import { Module } from '@nestjs/common'
import { DrizzleModule } from 'src/drizzle/drizzle.module'
import { OpenAiModule } from 'src/openai/openai.module'
import { AiService } from './ai.service'
import { NotifyUserModule } from 'src/notify-user/notify-user.module'

@Module({
    imports: [DrizzleModule, OpenAiModule, NotifyUserModule],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule {}
