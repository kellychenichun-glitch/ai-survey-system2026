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
import { SurveyVersion } from './survey-version.entity';
import { QuestionOption } from './question-option.entity';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  NUMBER = 'number',
  RATING = 'rating',
  MATRIX = 'matrix',
  RANKING = 'ranking',
}

@Entity('survey_questions')
export class SurveyQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  survey_version_id: string;

  @Column({ type: 'uuid', nullable: true })
  question_bank_id: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  question_type: QuestionType;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  display_order: number;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @Column({ type: 'boolean', default: false })
  is_skippable: boolean;

  @Column({ type: 'jsonb', default: {} })
  validation_rules: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  display_logic: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  scoring: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => SurveyVersion, (version) => version.questions)
  @JoinColumn({ name: 'survey_version_id' })
  version: SurveyVersion;

  @OneToMany(() => QuestionOption, (option) => option.question, {
    cascade: true,
  })
  options: QuestionOption[];
}
