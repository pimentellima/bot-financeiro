import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common'
import { NotifyUserService } from 'src/notify-user/notify-user.service'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'

@Controller('conversation')
export class ConversationController {
    constructor(
        private readonly whatsapp: WhatsappService,
        private readonly notifyUser: NotifyUserService
    ) {}

    @Post('send')
    @HttpCode(200)
    async sendMessage(@Body() body: any) {
        return await this.whatsapp.sendMessage('5575991698122', 'Hello')
    }

    @Post('schedule')
    @HttpCode(200)
    async scheduleMessage() {
        const today = new Date()
        const date = new Date(today.getTime() + 1 * 1000)
        return await this.notifyUser.scheduleReminderForUser(
            17,
            date,
            'Hello'
        )
    }
}
