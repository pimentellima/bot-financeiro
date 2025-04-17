import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common'
import { notifyUserTask } from 'src/trigger/notify-user'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'

@Controller('conversation')
export class ConversationController {
    constructor(
        private readonly whatsapp: WhatsappService,
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
        return notifyUserTask.trigger(
            { message: 'Hello', number: '75991698122' },
            { concurrencyKey: '-reminder', delay: date }
        )
    }
}
