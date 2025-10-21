import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterDto } from '../src/modules/auth/dto/register.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            const dataSource = app.get(DataSource);
            if (dataSource?.isInitialized) {
                await dataSource.destroy();
            }
            await app.close();
        }
        jest.useRealTimers();
    });

    describe('POST /auth/register', () => {
        const registerDto: RegisterDto = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test123!',
            profession: 'Software Engineer'
        };

        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto)
                .expect(201)
                .expect(res => {
                    expect(res.body).toHaveProperty('token');
                    expect(res.body.user).toHaveProperty('id');
                    expect(res.body.user.email).toBe(registerDto.email);
                    expect(res.body.user).not.toHaveProperty('password');
                });
        });

        it('should fail if email already exists', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto)
                .expect(409);
        });

        it('should fail with invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({ ...registerDto, email: 'invalid' })
                .expect(400);
        });
    });

    describe('POST /auth/login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Test123!'
        };

        it('should login successfully', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send(loginDto)
                .expect(200)
                .expect(res => {
                    expect(res.body).toHaveProperty('token');
                    expect(res.body.user).toHaveProperty('id');
                    expect(res.body.user.email).toBe(loginDto.email);
                });
        });

        it('should fail with wrong password', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ ...loginDto, password: 'Wrong123!' })
                .expect(401);
        });
    });

    describe('GET /auth/me', () => {
        let token: string;

        beforeAll(async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!'
                });
            token = response.body.token;
        });

        it('should get current user profile', () => {
            return request(app.getHttpServer())
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect(res => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.email).toBe('test@example.com');
                    expect(res.body).not.toHaveProperty('password');
                });
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/me')
                .expect(401);
        });

        it('should fail with invalid token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid')
                .expect(401);
        });
    });
});
