import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../drizzle/schema'
import { InferSelectModel } from 'drizzle-orm'
import { DRIZZLE } from 'src/drizzle/drizzle.constants'

@Injectable()
export class StatementsService {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<typeof schema>
    ) {}

    async insertStatement(
        statement: InferSelectModel<typeof schema.statements>
    ) {
        await this.db.insert(schema.statements).values(statement)
    }

    async findAll() {
        return await this.db.select().from(schema.users)
    }
}
