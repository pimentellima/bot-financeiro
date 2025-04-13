import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../drizzle/schema'
import { DRIZZLE } from 'src/drizzle/drizzle.constants'
import { eq } from 'drizzle-orm'

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>
    ) {}

    async getWaIdByUserId(userId: number) {
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, userId))

        if (!user) {
            throw new Error('User not found')
        }

        return user.waId
    }

    async findOrCreateUserByWaId(waId: string) {
        const [user] = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.waId, waId))

        if (user) {
            return user
        }

        const [newUser] = await this.db
            .insert(schema.users)
            .values({ waId })
            .returning()
        return newUser
    }

    async findAll() {
        return await this.db.select().from(schema.users)
    }
}
