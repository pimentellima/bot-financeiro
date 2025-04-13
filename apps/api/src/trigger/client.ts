import 'dotenv/config'
import { TriggerClient } from '@trigger.dev/sdk'
import { EnvironmentEnums } from 'src/enums/environment.enums'

export const client = new TriggerClient({
    id: 'app',
    apiKey: process.env[EnvironmentEnums.TRIGGER_API_KEY!],
})
