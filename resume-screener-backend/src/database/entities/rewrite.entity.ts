import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('rewrites')
@Unique(['draftId', 'version'])
export class Rewrite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'draft_id', type: 'uuid' })
    draftId: string;

    @Column()
    version: number;

    @Column({ name: 'content_json', type: 'jsonb' })
    contentJson: Record<string, any>;

    @Column()
    model: string;

    @Column({ name: 'tokens_used' })
    tokensUsed: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
