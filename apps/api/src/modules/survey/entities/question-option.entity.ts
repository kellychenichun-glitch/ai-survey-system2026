import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SurveyQuestion } from './survey-question.entity';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  question_id: string;

  @Column({ type: 'text' })
  option_text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  option_value: string;

  @Column({ type: 'int' })
  display_order: number;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ type: 'boolean', default: false })
  is_other_option: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => SurveyQuestion, (question) => question.options)
  @JoinColumn({ name: 'question_id' })
  question: SurveyQuestion;
}
