import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SurveyResponse } from './survey-response.entity';
import { SurveyQuestion } from './survey-question.entity';

@Entity('survey_response_answers')
export class SurveyResponseAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  response_id: string;

  @Column({ type: 'uuid' })
  question_id: string;

  @Column({ type: 'varchar', length: 50 })
  question_type: string;

  @Column({ type: 'text', nullable: true })
  answer_text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  answer_value: string;

  @Column({ type: 'simple-array', nullable: true })
  selected_options: string[];

  @Column({ type: 'int', nullable: true })
  answer_score: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  answered_at: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => SurveyResponse, (response) => response.answers)
  @JoinColumn({ name: 'response_id' })
  response: SurveyResponse;

  @ManyToOne(() => SurveyQuestion)
  @JoinColumn({ name: 'question_id' })
  question: SurveyQuestion;
}
