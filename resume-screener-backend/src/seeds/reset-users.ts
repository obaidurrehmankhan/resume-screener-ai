import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from 'src/modules/user/user.entity';
config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: false,
});

async function resetUsers() {
    try {
        console.log('🔁 Connecting to database...');
        await AppDataSource.initialize();

        const userRepo = AppDataSource.getRepository(User);

        console.log('🧹 Deleting all users...');
        await userRepo.clear();

        console.log('🔄 Resetting identity sequence...');
        await AppDataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;');

        console.log('✅ All users deleted and auto_increment reset');
    } catch (err) {
        console.error('❌ Error resetting users:', err);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}

resetUsers();
