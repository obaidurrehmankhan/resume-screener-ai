import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DraftStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  READY = 'READY',
  FINALIZED = 'FINALIZED',
}

export enum DraftSource {
  UPLOAD = 'UPLOAD',
  GENERAL = 'GENERAL',
}

@Entity('drafts')
@Index('idx_drafts_user_updated', ['userId', 'updatedAt'])
@Index('idx_drafts_guest', ['guestSessionId'])
@Index('idx_drafts_status', ['status'])
export class Draft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'guest_session_id', type: 'uuid', nullable: true })
  guestSessionId?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @Column({
    type: 'enum',
    enum: DraftStatus,
    default: DraftStatus.DRAFT,
  })
  status: DraftStatus;

  @Column({
    type: 'enum',
    enum: DraftSource,
    default: DraftSource.UPLOAD,
  })
  source: DraftSource;

  @Column({ name: 'resume_text', type: 'text', nullable: true })
  resumeText?: string;

  @Column({ name: 'jd_text', type: 'text', nullable: true })
  jdText?: string;

  @Column({ name: 'latest_analysis_id', type: 'uuid', nullable: true })
  latestAnalysisId?: string;

  @Column({ name: 'latest_rewrite_id', type: 'uuid', nullable: true })
  latestRewriteId?: string;

  @Column({ name: 'finalized_export_id', type: 'uuid', nullable: true })
  finalizedExportId?: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
