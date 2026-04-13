import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSurveyTables1704067300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create surveys table
    await queryRunner.createTable(
      new Table({
        name: 'surveys',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'survey_type',
            type: 'varchar',
            length: '50',
            default: "'standard'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
          },
          {
            name: 'current_version_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'welcome_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completion_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'max_responses',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'response_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'completion_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'avg_completion_time',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'closed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.query(`
      CREATE INDEX idx_surveys_status ON surveys(status);
      CREATE INDEX idx_surveys_created_by ON surveys(created_by);
      CREATE INDEX idx_surveys_tags ON surveys USING GIN(tags);
    `);

    // Create survey_versions table
    await queryRunner.createTable(
      new Table({
        name: 'survey_versions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'survey_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'version_number',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: false,
          },
          {
            name: 'snapshot_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'survey_versions',
      new TableForeignKey({
        columnNames: ['survey_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'surveys',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_survey_versions_unique ON survey_versions(survey_id, version_number);
      CREATE INDEX idx_survey_versions_is_active ON survey_versions(is_active);
    `);

    // Create survey_questions table
    await queryRunner.createTable(
      new Table({
        name: 'survey_questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'survey_version_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'question_bank_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'question_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'question_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_required',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_skippable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'validation_rules',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'display_logic',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'scoring',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'survey_questions',
      new TableForeignKey({
        columnNames: ['survey_version_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'survey_versions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      CREATE INDEX idx_survey_questions_version_id ON survey_questions(survey_version_id);
      CREATE INDEX idx_survey_questions_order ON survey_questions(survey_version_id, display_order);
    `);

    // Create question_options table
    await queryRunner.createTable(
      new Table({
        name: 'question_options',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'question_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'option_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'option_value',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'score',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_other_option',
            type: 'boolean',
            default: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'question_options',
      new TableForeignKey({
        columnNames: ['question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'survey_questions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(`
      CREATE INDEX idx_question_options_question_id ON question_options(question_id);
      CREATE INDEX idx_question_options_order ON question_options(question_id, display_order);
    `);

    // Create survey_responses table
    await queryRunner.createTable(
      new Table({
        name: 'survey_responses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'survey_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'survey_version_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'recipient_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'conversation_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'response_token',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'in_progress'",
          },
          {
            name: 'completion_percentage',
            type: 'int',
            default: 0,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'duration_seconds',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'survey_responses',
      new TableForeignKey({
        columnNames: ['survey_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'surveys',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'survey_responses',
      new TableForeignKey({
        columnNames: ['survey_version_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'survey_versions',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.query(`
      CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
      CREATE INDEX idx_survey_responses_status ON survey_responses(status);
      CREATE INDEX idx_survey_responses_started_at ON survey_responses(started_at);
    `);

    // Create survey_response_answers table
    await queryRunner.createTable(
      new Table({
        name: 'survey_response_answers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'response_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'question_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'question_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'answer_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'answer_value',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'selected_options',
            type: 'uuid',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'answer_score',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'answered_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'survey_response_answers',
      new TableForeignKey({
        columnNames: ['response_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'survey_responses',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'survey_response_answers',
      new TableForeignKey({
        columnNames: ['question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'survey_questions',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.query(`
      CREATE INDEX idx_response_answers_response_id ON survey_response_answers(response_id);
      CREATE INDEX idx_response_answers_question_id ON survey_response_answers(question_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('survey_response_answers');
    await queryRunner.dropTable('survey_responses');
    await queryRunner.dropTable('question_options');
    await queryRunner.dropTable('survey_questions');
    await queryRunner.dropTable('survey_versions');
    await queryRunner.dropTable('surveys');
  }
}
