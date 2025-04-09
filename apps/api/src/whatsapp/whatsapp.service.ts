import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvironmentEnums } from 'src/enums/environment.enums'

@Injectable()
export class WhatsappService {
    private apiToken: string
    private verificationToken: string
    private numberId: string

    constructor(private configService: ConfigService) {
        this.apiToken = this.configService.get(
            EnvironmentEnums.WHATSAPP_API_TOKEN
        ) as string
        this.verificationToken = this.configService.get(
            EnvironmentEnums.WHATSAPP_VERIFICATION_TOKEN
        ) as string
        this.numberId = this.configService.get(
            EnvironmentEnums.WHATSAPP_NUMBER_ID
        ) as string
    }

    async verifyToken(hubToken: string, hubChallenge: string) {
        if (hubToken === this.verificationToken) {
            return hubChallenge
        }
        throw new UnauthorizedException('Invalid verification token')
    }

    async sendMessage(message: string): Promise<any> {
        const url = `https://graph.facebook.com/v22.0/${this.numberId}/messages`
        const body = JSON.stringify({
            messaging_product: 'whatsapp',
            to: '5575991698122',
            type: 'text',
            text: { body: message },
        })
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
            },
            body,
        })
        if (!response.ok) {
            throw new HttpException(
                'Error sending message',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
