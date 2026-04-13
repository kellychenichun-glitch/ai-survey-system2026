import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { SurveyVersion } from './survey-version.entity';
import { SurveyResponseAnswer } from './survey-response-answer.entity';

export enum ResponseStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('survey_responses')
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  survey_id: string;

  @Column({ type: 'uuid' })
  survey_version_id: string;

  @Column({ type: 'uuid', nullable: true })
  recipient_id: string;

  @Column({ type: 'uuid', nullable: true })
  conversation_id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  response_token: string;

  @Column({ type: 'varchar', length: 50 })
  channel: string;

  @Column({
    type: 'enum',
    enum: ResponseStatus,
    default: ResponseStatus.IN_PROGRESS,
  })
  status: ResponseStatus;

  @Column({ type: 'int', default: 0 })
  completion_percentage: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'int', nullable: true })
  duration_seconds: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Survey, (survey) => survey.responses)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @ManyToOne(() => SurveyVersion)
  @JoinColumn({ name: 'survey_version_id' })
  version: SurveyVersion;

  @OneToMany(() => SurveyResponseAnswer, (answer) => answer.response, {
    cascade: true,
  })
  answers: SurveyResponseAnswer[];
}
