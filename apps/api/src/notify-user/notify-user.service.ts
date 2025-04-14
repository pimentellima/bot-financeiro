import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { configure } from '@trigger.dev/sdk/v3'
import { EnvironmentEnums } from 'src/enums/environment.enums'
import { notifyUserTask } from 'src/trigger/notify-user'
import { UsersService } from 'src/users/users.service'
import { getNumberFromWaId } from 'src/whatsapp/get-number-from-waid'

@Injectable()
export class NotifyUserService {
    constructor(
        private readonly user: UsersService,
        private readonly configService: ConfigService
    ) {
        configure({
            secretKey: this.configService.get(EnvironmentEnums.TRIGGER_API_KEY),
        })
    }

    async scheduleReminderForUser(userId: number, date: Date, message: string) {
        const waId = await this.user.getWaIdByUserId(userId)
        if (!waId) {
            throw new Error('User number not found')
        }
        console.log({ delay: date })
        return notifyUserTask.trigger(
            { message, number: getNumberFromWaId(waId) },
            { concurrencyKey: `${userId}-reminder`, delay: date }
        )
    }
}
