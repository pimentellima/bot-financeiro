import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { DrizzleModule } from 'src/drizzle/drizzle.module'

@Module({
    controllers: [UsersController],
    imports: [DrizzleModule],
    providers: [UsersService],
})
export class UsersModule {}
