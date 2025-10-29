import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { configureApp } from '../src/app.setup';
import { Analysis } from '../src/database/entities/analysis.entity';
import { Draft, DraftStatus } from '../src/database/entities/draft.entity';
import { Job, JobStatus, JobType } from '../src/database/entities/job.entity';
import { AnalysesController } from '../src/modules/analyses/analyses.controller';
import { AnalysesService } from '../src/modules/analyses/analyses.service';
import { AnalysisScoringService } from '../src/modules/analyses/analysis-scoring.service';
import { JobsController } from '../src/modules/jobs/jobs.controller';
import { JobsService } from '../src/modules/jobs/jobs.service';
import { ANALYSIS_QUEUE_NAME } from '../src/modules/jobs/queues/analysis.queue';
import { OptionalJwtAuthGuard } from '../src/common/security/optional-jwt-auth.guard';
import { GuestSessionGuard } from '../src/modules/guest/guest-session.guard';
import { ENTITIES } from '../src/database/entities';
import { RunAnalysisDto } from '../src/modules/analyses/dto/run-analysis.dto';

describe('Analysis + Jobs endpoints (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const queueAddMock = jest.fn();
  const queueStub = {
    add: queueAddMock,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoSave: false,
          location: ':memory:',
          entities: ENTITIES,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Analysis, Draft, Job]),
      ],
      controllers: [AnalysesController, JobsController],
      providers: [
        AnalysesService,
        AnalysisScoringService,
        JobsService,
        GuestSessionGuard,
        {
          provide: OptionalJwtAuthGuard,
          useValue: {
            canActivate: (ctx) => {
              const req = ctx.switchToHttp().getRequest();
              req.user = null;
              return true;
            },
          },
        },
        {
          provide: getQueueToken(ANALYSIS_QUEUE_NAME),
          useValue: queueStub,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    queueAddMock.mockReset();
  });

  it('enqueues analysis job and retrieves job result', async () => {
    await dataSource.synchronize(true);

    const draftRepository = dataSource.getRepository(Draft);
    const jobRepository = dataSource.getRepository(Job);
    const analysisRepository = dataSource.getRepository(Analysis);

    const sessionId = 'guest-session-test';

    const draft = await draftRepository.save(
      draftRepository.create({
        title: 'Draft 1',
        status: DraftStatus.DRAFT,
        guestSessionId: sessionId,
      }),
    );

    const runDto: RunAnalysisDto = {
      resumeText: 'Experienced engineer with 5 years in TypeScript.',
      jobDescription: 'Looking for engineers with TypeScript experience.',
    };

    const idempotencyKey = 'idem-key-123';

    const enqueueResponse = await request(app.getHttpServer())
      .post(`/api/drafts/${draft.id}/analysis`)
      .set('Cookie', [`guest_session=${sessionId}`])
      .set('Idempotency-Key', idempotencyKey)
      .send(runDto)
      .expect(202);

    expect(enqueueResponse.body.data.jobId).toBeDefined();
    expect(enqueueResponse.body.meta.idempotentReused).toBe(false);
    expect(queueAddMock).toHaveBeenCalledTimes(1);
    const jobId = enqueueResponse.body.data.jobId as string;

    const draftAfterEnqueue = await draftRepository.findOneByOrFail({ id: draft.id });
    expect(draftAfterEnqueue.status).toBe(DraftStatus.IN_REVIEW);

    const secondResponse = await request(app.getHttpServer())
      .post(`/api/drafts/${draft.id}/analysis`)
      .set('Cookie', [`guest_session=${sessionId}`])
      .set('Idempotency-Key', idempotencyKey)
      .send(runDto)
      .expect(202);

    expect(secondResponse.body.data.jobId).toBe(jobId);
    expect(secondResponse.body.meta.idempotentReused).toBe(true);
    expect(queueAddMock).toHaveBeenCalledTimes(1);

    const jobEntity = await jobRepository.findOneByOrFail({ id: jobId });

    const analysis = await analysisRepository.save(
      analysisRepository.create({
        draftId: draft.id,
        jobId,
        atsScore: 80,
        matchScore: 75,
        missingSkills: ['Go'],
        panelsAllowed: ['ATS'],
        parsingMeta: { tokens: 1500 },
        keywordHits: { overlapping: 10 },
      }),
    );

    await jobRepository.save({
      ...jobEntity,
      status: JobStatus.COMPLETED,
      type: JobType.ANALYSIS,
      finishedAt: new Date(),
      meta: {
        ...(jobEntity.meta ?? {}),
        analysisId: analysis.id,
      },
    });

    const jobResponse = await request(app.getHttpServer())
      .get(`/api/jobs/${jobId}`)
      .set('Cookie', [`guest_session=${sessionId}`])
      .expect(200);

    expect(jobResponse.body.data.job.id).toBe(jobId);
    expect(jobResponse.body.data.job.status).toBe(JobStatus.COMPLETED);
    expect(jobResponse.body.data.result.analysis.id).toBe(analysis.id);
  });
});
