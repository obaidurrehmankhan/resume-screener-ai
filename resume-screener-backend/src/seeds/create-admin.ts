import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from 'src/modules/user/user.entity';
config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: false,
});

const seedAdmin = async () => {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const existingAdmin = await userRepo.findOneBy({ email: 'admin@resumescan.io' });

    if (!existingAdmin) {
        const password = await bcrypt.hash('Admin@123', 10);
        const admin = userRepo.create({
            name: 'Super Admin',
            email: 'admin@resumescan.io',
            password,
            role: UserRole.ADMIN,
            profession: 'Admin',
        });
        await userRepo.save(admin);
        console.log('✅ Admin created');
    } else {
        console.log('⚠️ Admin already exists');
    }

    await AppDataSource.destroy();
};

seedAdmin();
