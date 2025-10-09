import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from 'typeorm';

enum FileKind {
    RESUME = 'resume',
    JD = 'jd'
}

@Entity('files')
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', nullable: true })
    userId?: string;

    @Column({ name: 'guest_session_id', nullable: true })
    guestSessionId?: string;

    @Column({
        type: 'enum',
        enum: FileKind
    })
    kind: FileKind;

    @Column()
    path: string;

    @Column()
    mime: string;

    @Column({ type: 'bigint' })
    size: number;

    @Column({ name: 'extracted_text', type: 'text', nullable: true })
    extractedText?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}