import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService, AnalyzeOptions } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('surveys/:id/analyze')
  @ApiOperation({ summary: '執行問卷分析' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '分析執行成功',
  })
  async analyzeSurvey(
    @Param('id') surveyId: string,
    @Body() options: AnalyzeOptions,
  ) {
    const result = await this.analyticsService.analyzeSurvey(surveyId, options);

    return {
      success: true,
      data: result,
    };
  }
}
