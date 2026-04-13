import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SurveyVersion } from './survey-version.entity';
import { SurveyResponse } from './survey-response.entity';

export enum SurveyType {
  STANDARD = 'standard',
  NPS = 'nps',
  SATISFACTION = 'satisfaction',
  MARKET_RESEARCH = 'market_research',
}

export enum SurveyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  CLOSED = 'closed',
}

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SurveyType,
    default: SurveyType.STANDARD,
  })
  survey_type: SurveyType;

  @Column({
    type: 'enum',
    enum: SurveyStatus,
    default: SurveyStatus.DRAFT,
  })
  status: SurveyStatus;

  @Column({ type: 'uuid', nullable: true })
  current_version_id: string;

  @Column({ type: 'text', nullable: true })
  welcome_message: string;

  @Column({ type: 'text', nullable: true })
  completion_message: string;

  @Column({ type: 'int', nullable: true })
  max_responses: number;

  @Column({ type: 'int', default: 0 })
  response_count: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  completion_rate: number;

  @Column({ type: 'int', nullable: true })
  avg_completion_time: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany(() => SurveyVersion, (version) => version.survey)
  versions: SurveyVersion[];

  @ManyToOne(() => SurveyVersion, { nullable: true })
  @JoinColumn({ name: 'current_version_id' })
  current_version: SurveyVersion;

  @OneToMany(() => SurveyResponse, (response) => response.survey)
  responses: SurveyResponse[];
}
