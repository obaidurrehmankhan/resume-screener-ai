import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from 'dotenv';
import { dataSourceOptions } from '../src/database/data-source';

config({ path: process.env.TEST_ENV_PATH || '.env.test' });

const testOptions: PostgresConnectionOptions = {
    ...(dataSourceOptions as PostgresConnectionOptions),
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'resume_screener_test',
    synchronize: true,
    dropSchema: true,
    migrationsRun: false,
    logging: false,
};

export const testDataSource = new DataSource(testOptions);
