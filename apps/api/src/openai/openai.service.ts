import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { generateText } from 'ai'
import OpenAI from 'openai'
import { EnvironmentEnums } from 'src/enums/environment.enums'

@Injectable()
export class OpenAIService {
    private openai: OpenAIProvider

    constructor(private configService: ConfigService) {
        this.openai = createOpenAI({
            apiKey: this.configService.get(EnvironmentEnums.OPENAI_API_KEY),
        })
    }

    async generateResponse(message: string): Promise<string> {
        const { text } = await generateText({
            model: this.openai('chatgpt-4o-latest'),
            messages: [{ content: message, role: 'user' }],
            system: 'You are a helpful assistant.',
        })

        return text
    }
}
