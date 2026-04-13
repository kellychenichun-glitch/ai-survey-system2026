import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { SurveyQuestion } from './survey-question.entity';
import { User } from '../../user/entities/user.entity';

@Entity('survey_versions')
export class SurveyVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  survey_id: string;

  @Column({ type: 'int' })
  version_number: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  snapshot_data: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Survey, (survey) => survey.versions)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @OneToMany(() => SurveyQuestion, (question) => question.version)
  questions: SurveyQuestion[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
