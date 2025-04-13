import { Module } from '@nestjs/common'
import { DrizzleModule } from 'src/drizzle/drizzle.module'
import { OpenAiModule } from 'src/openai/openai.module'
import { AiToolsService } from './ai-tools.service'
import { NotifyUserModule } from 'src/notify-user/notify-user.module'

@Module({
    imports: [DrizzleModule, OpenAiModule, NotifyUserModule],
    providers: [AiToolsService],
    exports: [AiToolsService],
})
export class AiToolsModule {}
