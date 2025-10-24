import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AnalysisScoringInput {
  resumeText?: string;
  jobDescription?: string;
  userId?: string;
  guestSessionId?: string;
  draftId: string;
}

export interface AnalysisScoringResult {
  atsScore: number;
  matchScore: number;
  missingSkills: string[];
  panelsAllowed: string[];
  parsingMeta: Record<string, unknown>;
  keywordHits: Record<string, unknown>;
}

@Injectable()
export class AnalysisScoringService {
  private readonly openAiApiKey?: string;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName =
      this.configService.get<string>('OPENAI_ANALYSIS_MODEL') ?? 'gpt-4.1-mini';
  }

  async scoreDraft(input: AnalysisScoringInput): Promise<AnalysisScoringResult> {
    if (!this.openAiApiKey) {
      return this.buildFallbackScore(input);
    }

    try {
      const response = await this.callOpenAi(input);
      return this.mapOpenAiResponse(response);
    } catch (error) {
      return this.buildFallbackScore(input);
    }
  }

  private async callOpenAi(
    input: AnalysisScoringInput,
  ): Promise<Record<string, unknown>> {
    const systemPrompt = [
      'You are an ATS assistant that compares a resume against a job description.',
      'Return JSON with fields: atsScore (0-100 int), matchScore (0-100 int),',
      'missingSkills (array of strings), panelsAllowed (array of strings among ATS, MATCH, SUGGESTIONS),',
      'parsingMeta (object), keywordHits (object).',
    ].join(' ');

    const userPrompt = JSON.stringify({
      resume: input.resumeText ?? '',
      job: input.jobDescription ?? '',
    });

    const body = {
      model: this.modelName,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openAiApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI analysis error: ${response.status} ${errorBody}`);
    }

    const parsed = await response.json();
    return parsed;
  }

  private mapOpenAiResponse(response: Record<string, unknown>): AnalysisScoringResult {
    const textContent = this.extractFirstText(response) ?? '{}';

    let parsed: Partial<AnalysisScoringResult> = {};
    try {
      parsed = JSON.parse(textContent) as Partial<AnalysisScoringResult>;
    } catch {
      // ignore parse errors; fallback below
    }

    return {
      atsScore: this.normalizeScore(parsed.atsScore),
      matchScore: this.normalizeScore(parsed.matchScore),
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      panelsAllowed: Array.isArray(parsed.panelsAllowed)
        ? parsed.panelsAllowed
        : ['ATS'],
      parsingMeta:
        typeof parsed.parsingMeta === 'object' && parsed.parsingMeta !== null
          ? parsed.parsingMeta
          : {},
      keywordHits:
        typeof parsed.keywordHits === 'object' && parsed.keywordHits !== null
          ? parsed.keywordHits
          : {},
    };
  }

  private extractFirstText(payload: Record<string, unknown>): string | undefined {
    const output = (payload as { output?: Array<{ content?: Array<{ text?: string }> }> }).output;
    if (!Array.isArray(output)) {
      return undefined;
    }

    for (const message of output) {
      if (!Array.isArray(message.content)) {
        continue;
      }
      for (const part of message.content) {
        if (typeof part?.text === 'string') {
          return part.text;
        }
      }
    }

    return undefined;
  }

  private normalizeScore(score?: number): number {
    if (typeof score !== 'number' || Number.isNaN(score)) {
      return 60;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private buildFallbackScore(input: AnalysisScoringInput): AnalysisScoringResult {
    const resumeLength = (input.resumeText ?? '').split(/\s+/).filter(Boolean).length;
    const jobLength = (input.jobDescription ?? '').split(/\s+/).filter(Boolean).length;
    const lengthRatio =
      resumeLength && jobLength
        ? Math.min(resumeLength, jobLength) / Math.max(resumeLength, jobLength)
        : 0.5;

    const atsScore = Math.max(55, Math.min(95, Math.round(60 + lengthRatio * 40)));
    const matchScore = Math.max(40, Math.min(90, Math.round(50 + lengthRatio * 35)));

    return {
      atsScore,
      matchScore,
      missingSkills: ['communication', 'leadership'].slice(0, jobLength ? 2 : 0),
      panelsAllowed: ['ATS'],
      parsingMeta: {
        resumeTokens: resumeLength,
        jobTokens: jobLength,
      },
      keywordHits: {
        overlapRatio: Number(lengthRatio.toFixed(2)),
      },
    };
  }
}
