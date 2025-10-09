import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// Load environment variables
config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'appuser',
    password: process.env.DB_PASSWORD || 'apppass',
    database: process.env.DB_NAME || 'appdb',
    entities: ['src/database/entities/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    ssl: false,
});