import 'dotenv/config'
import {
    defineConfig,
    ResolveEnvironmentVariablesFunction,
} from '@trigger.dev/sdk/v3'
import { EnvironmentEnums } from 'src/enums/environment.enums'

export default defineConfig({
    project: 'proj_xgufbpbpfjtphdnbhtqm',
    runtime: 'node',
    logLevel: 'log',
    // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
    // You can override this on an individual task.
    // See https://trigger.dev/docs/runs/max-duration
    maxDuration: 3600,
    retries: {
        enabledInDev: true,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },
    dirs: ['./src/trigger'],
})

export const resolveEnvVars: ResolveEnvironmentVariablesFunction = async ({
    env,
    environment,
    projectRef,
}) => {
    return {
        variables: [
            {
                name: EnvironmentEnums.TRIGGER_API_KEY,
                required: true,
                value: process.env[EnvironmentEnums.TRIGGER_API_KEY]!,
                description: 'The API key for the Trigger.dev API',
                type: 'secret',
            },
            {
                name: EnvironmentEnums.WHATSAPP_API_TOKEN,
                required: true,
                value: process.env[EnvironmentEnums.WHATSAPP_API_TOKEN]!,
                description: 'The API token for the WhatsApp API',
                type: 'secret',
            },
            
        ],
    }
}
