import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analyses')
@Index('idx_analyses_draft_created', ['draftId', 'createdAt'])
export class Analysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'draft_id', type: 'uuid' })
  draftId: string;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId?: string;

  @Column({ name: 'ats_score', type: 'int4' })
  atsScore: number;

  @Column({ name: 'match_score', type: 'int4', nullable: true })
  matchScore?: number;

  @Column({ name: 'missing_skills', type: 'text', array: true, nullable: true })
  missingSkills?: string[];

  @Column({ name: 'panels_allowed', type: 'text', array: true, nullable: true })
  panelsAllowed?: string[];

  @Column({ name: 'parsing_meta', type: 'jsonb', nullable: true })
  parsingMeta?: Record<string, unknown>;

  @Column({ name: 'keyword_hits', type: 'jsonb', nullable: true })
  keywordHits?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
