import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { configureApp } from '../src/app.setup';
import { setupSwagger } from '../src/app.swagger';
import { TestModule } from './test.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let originalAppOrigin: string | undefined;
  let originalNodeEnv: string | undefined;

  beforeEach(async () => {
    originalAppOrigin = process.env.APP_ORIGIN;
    process.env.APP_ORIGIN = 'http://localhost:4000';
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    if (originalAppOrigin === undefined) {
      delete process.env.APP_ORIGIN;
    } else {
      process.env.APP_ORIGIN = originalAppOrigin;
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    const dataSource = app.get(DataSource);
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/')
      .expect(200)
      .expect('Hello World!');
  });

  it('allows configured origin with credentials', async () => {
    const origin = 'http://localhost:4000';

    await request(app.getHttpServer())
      .get('/api/')
      .set('Origin', origin)
      .expect(200)
      .expect('Hello World!')
      .expect('access-control-allow-origin', origin)
      .expect('access-control-allow-credentials', 'true');
  });

  it('serves swagger docs in non-production environments', async () => {
    await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect('content-type', /json/)
      .expect((res) => {
        if (res.body?.info?.title !== 'Resume Screener API') {
          throw new Error('Swagger document missing expected title');
        }
      });
  });
});
