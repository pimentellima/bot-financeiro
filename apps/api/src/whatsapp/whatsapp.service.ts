import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvironmentEnums } from 'src/enums/environment.enums'
import { sendMessageToWhatsapp } from 'src/utils/send-message-to-whatsapp'

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

    async sendMessage(number: string, message: string): Promise<any> {
        const response = await sendMessageToWhatsapp(
            this.apiToken,
            this.numberId,
            number,
            message
        )
        if (!response.ok) {
            throw new HttpException(
                response.statusText || 'Internal Error',
                response.status || HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
        return await response.json()
    }
}
