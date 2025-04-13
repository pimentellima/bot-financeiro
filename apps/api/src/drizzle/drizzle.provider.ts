import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { EnvironmentEnums } from 'src/enums/environment.enums'
import { DRIZZLE } from './drizzle.constants'
import * as schema from './schema'

export const DrizzleProvider: Provider = {
    provide: DRIZZLE,
    useFactory: (configService: ConfigService) => {
        const pool = new Pool({
            connectionString: configService.get(EnvironmentEnums.DATABASE_URL),
        })
        return drizzle(pool, { schema })
    },
    inject: [ConfigService],
}
