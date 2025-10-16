import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { GuestModule } from './guest.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { dataSourceOptions } from '../database/data-source';
import { DataSource } from 'typeorm';
import { ENTITIES } from '../database/entities';

describe('Guest Module (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    ...dataSourceOptions,
                    synchronize: true,
                    dropSchema: true,
                    migrationsRun: false,
                    entities: ENTITIES,
                }),
                ThrottlerModule.forRoot({
                    throttlers: [
                        {
                            ttl: 60000,
                            limit: 10,
                        }
                    ],
                }),
                GuestModule
            ],
            providers: [
                {
                    provide: APP_GUARD,
                    useClass: ThrottlerGuard,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
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
    });

    describe('Guest Session', () => {
        it('should create a guest session cookie on first request', () => {
            return request(app.getHttpServer())
                .post('/guest/drafts')
                .expect(201)
                .expect((res) => {
                    expect(res.headers['set-cookie']).toBeDefined();
                    expect(res.headers['set-cookie'][0]).toMatch(/guest_session=.*;/);
                });
        });

        it('should use existing session cookie for subsequent requests', async () => {
            const firstResponse = await request(app.getHttpServer())
                .post('/guest/drafts')
                .expect(201);

            const cookie = firstResponse.headers['set-cookie'];
            const { draftId } = firstResponse.body;

            return request(app.getHttpServer())
                .get(`/guest/drafts/${draftId}`)
                .set('Cookie', cookie)
                .expect(200);
        });

    });
});
