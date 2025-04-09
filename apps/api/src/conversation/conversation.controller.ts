import { Controller, Post, Body } from '@nestjs/common'
import { WhatsappService } from 'src/whatsapp/whatsapp.service'

@Controller('conversation')
export class ConversationController {
    constructor(private readonly metaService: WhatsappService) {}

    @Post('send')
    async sendMessage(@Body() body: any) {
        return this.metaService.sendMessage('Hello')
    }
}
