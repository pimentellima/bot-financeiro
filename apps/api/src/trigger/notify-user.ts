import { logger, task } from '@trigger.dev/sdk/v3'
import { EnvironmentEnums } from 'src/enums/environment.enums'
import { sendMessageToWhatsapp } from 'src/utils/send-message-to-whatsapp'

export const notifyUserTask = task({
    id: 'user-reminder',
    onFailure: async (error) => {
        logger.error('Error scheduling reminder:', error)
    },
    onSuccess: async () => logger.log('success'),
    run: async (payload: { number: string; message: string }) => {
        logger.log('Running task')
        const response = await sendMessageToWhatsapp(
            process.env[EnvironmentEnums.WHATSAPP_API_TOKEN]!,
            process.env[EnvironmentEnums.WHATSAPP_NUMBER_ID]!,
            payload.number,
            payload.message
        )
        if (!response.ok) {
            throw new Error(
                `Error sending message to whatsapp API. Status: ${response.status}`
            )
        }
        return { success: true }
    },
})
