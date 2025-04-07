import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../drizzle/schema'

@Injectable()
export class UsersService {
    constructor(
        @Inject('DRIZZLE_PROVIDER')
        private readonly db: NodePgDatabase<typeof schema>
    ) {}
    async findAll() {
        return await this.db.select().from(schema.users)
    }
}
