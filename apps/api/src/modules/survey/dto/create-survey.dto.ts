import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyType } from '../entities/survey.entity';

export class CreateSurveyDto {
  @ApiProperty({
    description: '問卷標題',
    example: '2024 Q1 客戶滿意度調查',
  })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({
    description: '問卷描述',
    example: '評估客戶對產品與服務的滿意度',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '問卷類型',
    enum: SurveyType,
    example: SurveyType.SATISFACTION,
  })
  @IsEnum(SurveyType)
  survey_type: SurveyType;

  @ApiPropertyOptional({
    description: '歡迎訊息',
    example: '感謝您撥冗填寫本問卷',
  })
  @IsString()
  @IsOptional()
  welcome_message?: string;

  @ApiPropertyOptional({
    description: '完成訊息',
    example: '感謝您的寶貴意見！',
  })
  @IsString()
  @IsOptional()
  completion_message?: string;

  @ApiPropertyOptional({
    description: '標籤',
    example: ['客戶滿意度', 'Q1'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: '最大回收數',
    example: 1000,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  max_responses?: number;

  @ApiPropertyOptional({
    description: '額外資料',
    example: { project_code: 'PRJ-2024-001' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
