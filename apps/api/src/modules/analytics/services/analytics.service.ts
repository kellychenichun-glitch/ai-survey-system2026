import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaudeService } from '../../ai/services/claude.service';
import { Survey } from '../../survey/entities/survey.entity';
import { SurveyResponse } from '../../survey/entities/survey-response.entity';

export interface AnalyzeOptions {
  rule_set_id?: string;
  analysis_types?: string[];
  filters?: {
    date_from?: string;
    date_to?: string;
    channels?: string[];
    status?: string;
  };
  options?: {
    include_demographics?: boolean;
    include_crosstab?: boolean;
    generate_report?: boolean;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyResponse)
    private readonly responseRepository: Repository<SurveyResponse>,
    private readonly claudeService: ClaudeService,
  ) {}

  /**
   * 執行問卷分析
   */
  async analyzeSurvey(surveyId: string, options: AnalyzeOptions) {
    // 1. 驗證問卷存在
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['current_version', 'current_version.questions'],
    });

    if (!survey) {
      throw new NotFoundException('問卷不存在');
    }

    // 2. 取得問卷回覆資料
    const responsesQuery = this.responseRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.answers', 'answers')
      .leftJoinAndSelect('answers.question', 'question')
      .where('response.survey_id = :surveyId', { surveyId })
      .andWhere('response.status = :status', { status: 'completed' });

    // 應用篩選條件
    if (options.filters?.date_from) {
      responsesQuery.andWhere('response.started_at >= :dateFrom', {
        dateFrom: options.filters.date_from,
      });
    }

    if (options.filters?.date_to) {
      responsesQuery.andWhere('response.started_at <= :dateTo', {
        dateTo: options.filters.date_to,
      });
    }

    if (options.filters?.channels) {
      responsesQuery.andWhere('response.channel IN (:...channels)', {
        channels: options.filters.channels,
      });
    }

    const responses = await responsesQuery.getMany();

    if (responses.length === 0) {
      return {
        job_id: null,
        status: 'no_data',
        message: '沒有可分析的資料',
      };
    }

    // 3. 執行各項分析
    const analysisTypes = options.analysis_types || [
      'statistics',
      'sentiment',
      'topics',
      'summary',
    ];

    const results: any = {};

    // 基礎統計分析
    if (analysisTypes.includes('statistics')) {
      results.statistics = await this.performStatistics(survey, responses);
    }

    // 情緒分析
    if (analysisTypes.includes('sentiment')) {
      results.sentiment = await this.performSentimentAnalysis(
        survey,
        responses,
      );
    }

    // 主題分群
    if (analysisTypes.includes('topics')) {
      results.topics = await this.performTopicClustering(survey, responses);
    }

    // 生成摘要
    if (analysisTypes.includes('summary')) {
      results.summary = await this.generateAnalysisSummary(
        survey,
        responses,
        results,
      );
    }

    return {
      survey_id: surveyId,
      total_responses: responses.length,
      analysis_timestamp: new Date(),
      results,
    };
  }

  /**
   * 統計分析
   */
  private async performStatistics(survey: Survey, responses: any[]) {
    const totalResponses = responses.length;
    const completedResponses = responses.filter(
      (r) => r.status === 'completed',
    ).length;

    // 計算平均完成時間
    const avgCompletionTime =
      responses.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) /
      totalResponses;

    // 各題統計
    const questionStats = {};

    for (const question of survey.current_version.questions) {
      const answers = responses
        .flatMap((r) => r.answers)
        .filter((a) => a.question_id === question.id);

      if (question.question_type === 'single_choice' || 
          question.question_type === 'multiple_choice') {
        // 選擇題統計
        const distribution = this.calculateDistribution(answers, question);
        questionStats[question.id] = {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          total_answers: answers.length,
          distribution,
        };
      } else if (question.question_type === 'text') {
        // 開放題統計
        questionStats[question.id] = {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          total_answers: answers.length,
          avg_length: this.calculateAvgLength(answers),
        };
      }
    }

    return {
      total_responses: totalResponses,
      completed_responses: completedResponses,
      completion_rate: (completedResponses / totalResponses) * 100,
      avg_completion_time: Math.round(avgCompletionTime),
      question_stats: Object.values(questionStats),
    };
  }

  /**
   * 情緒分析
   */
  private async performSentimentAnalysis(survey: Survey, responses: any[]) {
    // 收集所有開放題回答
    const openEndedAnswers = responses
      .flatMap((r) => r.answers)
      .filter((a) => a.question_type === 'text' && a.answer_text)
      .map((a) => a.answer_text);

    if (openEndedAnswers.length === 0) {
      return { message: '沒有開放題回答可供分析' };
    }

    // 使用 Claude API 進行情緒分析
    const sentimentResult = await this.claudeService.analyzeSentiment(
      openEndedAnswers,
      {
        sensitivity: 'standard',
      },
    );

    return sentimentResult;
  }

  /**
   * 主題分群
   */
  private async performTopicClustering(survey: Survey, responses: any[]) {
    const openEndedAnswers = responses
      .flatMap((r) => r.answers)
      .filter((a) => a.question_type === 'text' && a.answer_text)
      .map((a) => a.answer_text);

    if (openEndedAnswers.length === 0) {
      return { message: '沒有開放題回答可供分析' };
    }

    // 使用 Claude API 進行主題分群
    const topicResult = await this.claudeService.clusterTopics(
      openEndedAnswers,
      {
        min_topics: 3,
        max_topics: 8,
      },
    );

    return topicResult;
  }

  /**
   * 生成分析摘要
   */
  private async generateAnalysisSummary(
    survey: Survey,
    responses: any[],
    analysisResults: any,
  ) {
    const summaryPrompt = `請為以下問卷分析結果生成一份完整的摘要報告。

問卷名稱：${survey.title}
回收份數：${responses.length}

統計結果：
${JSON.stringify(analysisResults.statistics, null, 2)}

情緒分析：
${JSON.stringify(analysisResults.sentiment, null, 2)}

主題分析：
${JSON.stringify(analysisResults.topics, null, 2)}

請生成以下內容（JSON 格式）：
{
  "executive_summary": "執行摘要（2-3 段）",
  "key_findings": ["主要發現1", "主要發現2", "主要發現3"],
  "risk_signals": ["風險訊號1", "風險訊號2"],
  "recommendations": ["建議行動1", "建議行動2", "建議行動3"],
  "representative_opinions": [
    {"category": "positive", "quote": "正面意見範例"},
    {"category": "improvement", "quote": "改進建議範例"}
  ]
}`;

    const summary = await this.claudeService.analyze(summaryPrompt, {
      temperature: 0.5,
      max_tokens: 3000,
    });

    return summary;
  }

  /**
   * 計算選項分布
   */
  private calculateDistribution(answers: any[], question: any) {
    const optionCounts = {};

    // 初始化計數
    if (question.options) {
      question.options.forEach((opt) => {
        optionCounts[opt.id] = 0;
      });
    }

    // 計算各選項被選次數
    answers.forEach((answer) => {
      if (answer.selected_options) {
        answer.selected_options.forEach((optId) => {
          if (optionCounts[optId] !== undefined) {
            optionCounts[optId]++;
          }
        });
      }
    });

    // 轉換為分布陣列
    const total = answers.length;
    return Object.entries(optionCounts).map(([optionId, count]) => {
      const option = question.options.find((o) => o.id === optionId);
      return {
        option_id: optionId,
        option_text: option?.option_text || '',
        count: count as number,
        percentage: total > 0 ? ((count as number / total) * 100).toFixed(2) : 0,
      };
    });
  }

  /**
   * 計算平均長度
   */
  private calculateAvgLength(answers: any[]) {
    const totalLength = answers.reduce(
      (sum, a) => sum + (a.answer_text?.length || 0),
      0,
    );
    return answers.length > 0 ? Math.round(totalLength / answers.length) : 0;
  }
}
