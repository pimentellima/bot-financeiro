import { OpenAIProvider } from '@ai-sdk/openai'
import { experimental_transcribe as transcribe } from 'ai'
import 'dotenv/config'

export async function transcribeAudio(audio: Buffer, openAi: OpenAIProvider) {
    const result = await transcribe({
        audio,
        model: openAi.transcription('gpt-4o-mini-transcribe'),
    })

    return result.text
}
