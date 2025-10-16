import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    Index
} from 'typeorm';
import { Draft } from './draft.entity';

@Entity('analyses')
@Index(['draftId', 'createdAt'])
export class Analysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'draft_id', type: 'uuid' })
    draftId: string;

    @Column({ name: 'match_score', type: 'float' })
    matchScore: number;

    @Column({ name: 'ats_score', type: 'float', nullable: true })
    atsScore?: number;

    @Column({ name: 'suggestions_json', type: 'jsonb', nullable: true })
    suggestionsJson?: Record<string, any>;

    @Column()
    model: string;

    @Column({ name: 'tokens_used' })
    tokensUsed: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    // Relationships
    @ManyToOne(() => Draft, draft => draft.analyses)
    draft: Draft;
}
