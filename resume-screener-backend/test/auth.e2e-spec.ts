import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { RegisterDto } from '../src/modules/auth/dto/register.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';

type SupertestAgent = ReturnType<typeof request.agent>;

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let agent: SupertestAgent;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.use(cookieParser());
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        agent = request.agent(app.getHttpServer());
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
            return agent
                .post('/api/auth/register')
                .send(registerDto)
                .expect(201)
                .expect(res => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.email).toBe(registerDto.email);
                    expect(res.body).not.toHaveProperty('password');
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

        it('should fail with wrong password', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ ...loginDto, password: 'Wrong123!' })
                .expect(401);
        });
    });

    describe('GET /auth/me', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'Test123!',
        };

        beforeAll(async () => {
            await agent
                .post('/api/auth/login')
                .send(loginDto)
                .expect(200);
        });

        it('should get current user profile', () => {
            return agent
                .get('/api/auth/me')
                .expect(200)
                .expect(res => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.email).toBe('test@example.com');
                    expect(res.body).not.toHaveProperty('password');
                });
        });

        it('should refresh session and then logout', async () => {
            const refreshRes = await agent
                .post('/api/auth/refresh')
                .expect(200);

            expect(refreshRes.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('access_token='),
                    expect.stringContaining('refresh_token='),
                ]),
            );

            await agent.post('/api/auth/logout').expect(204);
            await agent.get('/api/auth/me').expect(401);

            await agent.post('/api/auth/login').send(loginDto).expect(200);
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/me')
                .expect(401);
        });

        it('should fail with invalid token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/me')
                .set('Cookie', 'access_token=invalid')
                .expect(401);
        });
    });
});
