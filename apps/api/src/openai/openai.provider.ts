import { createOpenAI } from '@ai-sdk/openai'
import { EnvironmentEnums } from 'src/enums/environment.enums'
import { OPENAI } from './openai.constants'
import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export const OpenAiProvider: Provider = {
    provide: OPENAI,
    useFactory: (configService: ConfigService) => {
        const openAi = createOpenAI({
            apiKey: configService.get(EnvironmentEnums.OPENAI_API_KEY),
        })
        return openAi
    },
    inject: [ConfigService],
}
