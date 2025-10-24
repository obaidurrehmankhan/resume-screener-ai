import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalysesService } from './analyses.service';
import { Analysis } from '../../database/entities/analysis.entity';
import { Draft, DraftStatus } from '../../database/entities/draft.entity';
import { Job as JobEntity } from '../../database/entities/job.entity';
import { ANALYSIS_QUEUE_NAME, AnalysisQueuePayload } from '../jobs/queues/analysis.queue';
import { AnalysisScoringService } from './analysis-scoring.service';

describe('AnalysesService', () => {
  let service: AnalysesService;
  const analysisRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const draftRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const jobRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const queue = {
    add: jest.fn(),
  };
  const analysisScoringService = {
    scoreDraft: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysesService,
        {
          provide: getRepositoryToken(Analysis),
          useValue: analysisRepository,
        },
        {
          provide: getRepositoryToken(Draft),
          useValue: draftRepository,
        },
        {
          provide: getRepositoryToken(JobEntity),
          useValue: jobRepository,
        },
        {
          provide: getQueueToken(ANALYSIS_QUEUE_NAME),
          useValue: queue,
        },
        {
          provide: AnalysisScoringService,
          useValue: analysisScoringService,
        },
      ],
    }).compile();

    service = module.get<AnalysesService>(AnalysesService);
    jest.clearAllMocks();
    analysisScoringService.scoreDraft.mockReset();
  });

  describe('processAnalysisJob', () => {
    it('persists analysis and sets draft status to READY', async () => {
      const draft: Partial<Draft> = {
        id: 'draft-1',
        status: DraftStatus.DRAFT,
      };

      const jobPayload: AnalysisQueuePayload = {
        jobEntityId: 'job-1',
        draftId: 'draft-1',
        resumeText: 'alpha beta gamma delta epsilon zeta',
        jobDescription: 'alpha beta gamma delta',
      };

      draftRepository.findOne.mockResolvedValue(draft);

      const createdAnalysis: Partial<Analysis> = {
        draftId: jobPayload.draftId,
        jobId: jobPayload.jobEntityId,
      };

      const scoringResult = {
        atsScore: 87,
        matchScore: 73,
        missingSkills: ['communication', 'leadership'],
        panelsAllowed: ['ATS', 'MATCH'],
        parsingMeta: { resumeTokens: 6, jobTokens: 4 },
        keywordHits: { overlapRatio: 0.67 },
      };

      analysisScoringService.scoreDraft.mockResolvedValue(scoringResult);

      const savedAnalysis: Analysis = {
        ...createdAnalysis,
        id: 'analysis-1',
        atsScore: scoringResult.atsScore,
        matchScore: scoringResult.matchScore,
        missingSkills: scoringResult.missingSkills,
        panelsAllowed: scoringResult.panelsAllowed,
        parsingMeta: scoringResult.parsingMeta,
        keywordHits: scoringResult.keywordHits,
        draftId: jobPayload.draftId,
        jobId: jobPayload.jobEntityId,
        createdAt: new Date(),
      };

      analysisRepository.create.mockReturnValue(createdAnalysis);
      analysisRepository.save.mockResolvedValue(savedAnalysis);
      draftRepository.save.mockResolvedValue({
        ...draft,
        latestAnalysisId: savedAnalysis.id,
        status: DraftStatus.READY,
      });

      const result = await service.processAnalysisJob(jobPayload);

      expect(analysisScoringService.scoreDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          draftId: jobPayload.draftId,
          resumeText: jobPayload.resumeText,
        }),
      );
      expect(analysisRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          draftId: jobPayload.draftId,
          jobId: jobPayload.jobEntityId,
        }),
      );
      expect(analysisRepository.save).toHaveBeenCalledWith(createdAnalysis);
      expect(draftRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          latestAnalysisId: savedAnalysis.id,
          status: DraftStatus.READY,
        }),
      );
      expect(draft.status).toBe(DraftStatus.READY);
      expect(draft.latestAnalysisId).toBe(savedAnalysis.id);
      expect(result).toEqual(savedAnalysis);
    });
  });
});
