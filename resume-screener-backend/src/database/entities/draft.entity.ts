import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    Index
} from 'typeorm';
// Make sure the file 'analysis.entity.ts' exists in the same directory as this file.
// If the file is named differently (e.g., 'Analysis.entity.ts' or 'analysisEntity.ts'), update the import accordingly.
import { Analysis } from './analysis.entity';
import { Rewrite } from './rewrite.entity';
import { User } from '../../modules/user/user.entity';

enum DraftStatus {
    DRAFT = 'draft',
    FINAL = 'final'
}

@Entity('drafts')
@Index(['userId'])
@Index(['guestSessionId'])
@Index(['expiresAt'])
export class Draft {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId?: string;

    @Column({ name: 'guest_session_id', nullable: true })
    guestSessionId?: string;

    @Column({ name: 'is_guest', default: false })
    isGuest: boolean;

    @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
    expiresAt?: Date;

    @Column({ nullable: true })
    title?: string;

    @Column({ name: 'resume_text', type: 'text', nullable: true })
    resumeText?: string;

    @Column({ name: 'jd_text', type: 'text', nullable: true })
    jdText?: string;

    @Column({ name: 'resume_file_path', nullable: true })
    resumeFilePath?: string;

    @Column({ name: 'jd_file_path', nullable: true })
    jdFilePath?: string;

    @Column({
        type: 'enum',
        enum: DraftStatus,
        default: DraftStatus.DRAFT
    })
    status: DraftStatus;

    @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt?: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => User, user => user.drafts)
    user: User;

    @OneToMany(() => Analysis, analysis => analysis.draft)
    analyses: Analysis[];

    @OneToMany(() => Rewrite, rewrite => rewrite.draft)
    rewrites: Rewrite[];
}
