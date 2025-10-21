import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Draft } from '../../database/entities/draft.entity';
import { Analysis } from '../../database/entities/analysis.entity';

@Injectable()
export class GuestService {
    constructor(
        @InjectRepository(Draft)
        private draftRepository: Repository<Draft>,
        @InjectRepository(Analysis)
        private analysisRepository: Repository<Analysis>
    ) { }

    async createDraft(guestSessionId: string): Promise<{ draftId: string }> {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const draft = this.draftRepository.create({
            isGuest: true,
            guestSessionId,
            expiresAt
        });

        const savedDraft = await this.draftRepository.save(draft);
        return { draftId: savedDraft.id };
    }

    async getDraft(id: string, guestSessionId: string): Promise<Partial<Draft>> {
        const draft = await this.draftRepository.findOne({
            where: { id, guestSessionId }
        });

        if (!draft) {
            throw new NotFoundException('Draft not found');
        }

        // Return minimal fields
        return {
            id: draft.id,
            title: draft.title,
            createdAt: draft.createdAt,
            expiresAt: draft.expiresAt
        };
    }

    async createAnalysis(draftId: string, guestSessionId: string): Promise<{ matchScore: number }> {
        // Verify draft ownership
        const draft = await this.draftRepository.findOne({
            where: { id: draftId, guestSessionId }
        });

        if (!draft) {
            throw new NotFoundException('Draft not found');
        }

        // Stub: Create analysis with hardcoded score
        const analysis = this.analysisRepository.create({
            draftId,
            matchScore: 75.5, // Hardcoded for now
            model: 'mock-model',
            tokensUsed: 120,
            suggestionsJson: {
                summary: 'Sample suggestions for guest draft',
            },
        });

        await this.analysisRepository.save(analysis);
        return { matchScore: analysis.matchScore };
    }
}
