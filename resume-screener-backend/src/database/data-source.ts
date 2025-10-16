import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ENTITIES } from './entities';

config();

const toBool = (value?: string) => {
    if (!value) return false;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

const isTsEnv = __filename.endsWith('.ts');

const migrationsPaths = isTsEnv
    ? [join(__dirname, 'migrations', '*.ts')]
    : [join(__dirname, 'migrations', '*.js')];

const buildSslConfig = () => {
    const sslRequested =
        toBool(process.env.DB_SSL) ||
        toBool(process.env.DB_REQUIRE_SSL) ||
        (process.env.DATABASE_URL ?? '').includes('sslmode=require');

    if (!sslRequested) {
        return false;
    }

    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED
        ? toBool(process.env.DB_SSL_REJECT_UNAUTHORIZED)
        : false;

    const caPath = process.env.DB_SSL_CA ?? process.env.DB_SSL_CA_PATH;
    const ca =
        caPath && existsSync(caPath)
            ? readFileSync(caPath, 'utf8')
            : undefined;

    return ca
        ? { ca, rejectUnauthorized }
        : { rejectUnauthorized };
};

const buildPoolConfig = () => {
    const hasPoolOverrides =
        process.env.DB_POOL_MAX ||
        process.env.DB_POOL_IDLE ||
        process.env.DB_CONN_TIMEOUT;

    if (!hasPoolOverrides) {
        return undefined;
    }

    return {
        max: Number(process.env.DB_POOL_MAX ?? 10),
        idleTimeoutMillis: Number(process.env.DB_POOL_IDLE ?? 30000),
        connectionTimeoutMillis: Number(
            process.env.DB_CONN_TIMEOUT ?? 10000,
        ),
    };
};

const buildDataSourceOptions = (): DataSourceOptions => {
    const ssl = buildSslConfig();
    const pool = buildPoolConfig();
    const logging =
        process.env.DB_LOGGING !== undefined
            ? toBool(process.env.DB_LOGGING)
            : process.env.NODE_ENV !== 'production';

    const baseOptions: DataSourceOptions = {
        type: 'postgres',
        entities: ENTITIES,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        migrationsRun: false,
        migrationsTableName: process.env.DB_MIGRATIONS_TABLE ?? 'migrations',
        migrations: migrationsPaths,
        logging,
    };

    const extra =
        pool || ssl
            ? {
                ...(pool ?? {}),
                ...(ssl ? { ssl } : {}),
            }
            : undefined;

    if (process.env.DATABASE_URL) {
        return {
            ...baseOptions,
            url: process.env.DATABASE_URL,
            ssl,
            extra,
        };
    }

    const host = process.env.DB_HOST ?? 'localhost';
    const port = Number(process.env.DB_PORT ?? 5433);
    const username = process.env.DB_USERNAME ?? 'postgres';
    const password = process.env.DB_PASSWORD ?? 'postgres';
    const database =
        process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'postgres';

    return {
        ...baseOptions,
        host,
        port,
        username,
        password,
        database,
        ssl,
        extra,
    };
};

export const dataSourceOptions = buildDataSourceOptions();

export default new DataSource(dataSourceOptions);
