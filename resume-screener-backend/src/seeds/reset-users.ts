import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { config } from 'dotenv';
config();

const AppDataSource = new DataSource({
    type: 'mysql',
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

        console.log('🔄 Resetting AUTO_INCREMENT...');
        await AppDataSource.query('ALTER TABLE user AUTO_INCREMENT = 1;');

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
