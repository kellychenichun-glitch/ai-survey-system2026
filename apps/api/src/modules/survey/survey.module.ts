import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';
import { SurveyVersion } from './entities/survey-version.entity';
import { SurveyQuestion } from './entities/survey-question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import { SurveyResponseAnswer } from './entities/survey-response-answer.entity';
import { SurveyController } from './controllers/survey.controller';
import { SurveyService } from './services/survey.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Survey,
      SurveyVersion,
      SurveyQuestion,
      QuestionOption,
      SurveyResponse,
      SurveyResponseAnswer,
    ]),
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService, TypeOrmModule],
})
export class SurveyModule {}
