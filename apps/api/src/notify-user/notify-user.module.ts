import { Module } from '@nestjs/common'
import { NotifyUserService } from './notify-user.service'
import { UsersModule } from 'src/users/users.module'

@Module({
    imports: [UsersModule],
    providers: [NotifyUserService],
    exports: [NotifyUserService],
})
export class NotifyUserModule {}
