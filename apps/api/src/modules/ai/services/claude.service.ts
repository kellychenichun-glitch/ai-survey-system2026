import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeAnalysisOptions {
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

@Injectable()
export class ClaudeService {
  private client: Anthropic;
  private model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get('CLAUDE_API_KEY'),
    });
    this.model =
      this.configService.get('CLAUDE_MODEL') || 'claude-sonnet-4-20250514';
  }

  /**
   * 基本對話
   */
  async chat(
    messages: ClaudeMessage[],
    options?: ClaudeAnalysisOptions,
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.max_tokens || 4096,
        temperature: options?.temperature || 0.7,
        system: options?.system,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      // 提取文字回應
      const textContent = response.content.find(
        (block) => block.type === 'text',
      );
      return textContent ? (textContent as any).text : '';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude API 呼叫失敗: ${error.message}`);
    }
  }

  /**
   * 分析文本（用於情緒分析、主題分群等）
   */
  async analyze(
    prompt: string,
    options?: ClaudeAnalysisOptions,
  ): Promise<any> {
    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      options,
    );

    // 嘗試解析 JSON 回應
    try {
      return JSON.parse(response);
    } catch (error) {
      // 如果不是 JSON，返回原始文字
      return { text: response };
    }
  }

  /**
   * 生成摘要
   */
  async generateSummary(
    content: string,
    options?: {
      max_length?: number;
      style?: string;
      include_key_findings?: boolean;
      include_recommendations?: boolean;
    },
  ): Promise<any> {
    const systemPrompt = `你是一位專業的分析師，擅長從資料中提取關鍵洞察並生成清晰的摘要。

請以 JSON 格式回應，包含以下欄位：
- executive_summary: 執行摘要（2-3 句話）
- key_findings: 主要發現（陣列，3-5 項）
- ${options?.include_recommendations ? 'recommendations: 建議行動（陣列，3-5 項）' : ''}
- ${options?.include_key_findings ? 'risk_signals: 風險訊號（陣列，如有）' : ''}

${options?.style ? `摘要風格：${options.style}` : ''}
${options?.max_length ? `摘要長度限制：約 ${options.max_length} 字` : ''}`;

    return await this.analyze(content, {
      system: systemPrompt,
      temperature: 0.5,
      max_tokens: 2000,
    });
  }

  /**
   * 情緒分析
   */
  async analyzeSentiment(
    texts: string[],
    options?: {
      labels?: string[];
      sensitivity?: string;
    },
  ): Promise<any> {
    const systemPrompt = `你是一位情緒分析專家。請分析以下文本的情緒傾向。

情緒分類：${options?.labels?.join(', ') || 'positive, neutral, negative'}
敏感度：${options?.sensitivity || 'standard'}

請以 JSON 格式回應：
{
  "overall": {
    "positive": 數量,
    "neutral": 數量,
    "negative": 數量,
    "positive_percentage": 百分比,
    "neutral_percentage": 百分比,
    "negative_percentage": 百分比
  },
  "individual": [
    {"index": 0, "sentiment": "positive", "score": 0.8, "confidence": 0.9},
    ...
  ]
}`;

    const userPrompt = `請分析以下 ${texts.length} 則文本：

${texts.map((text, i) => `${i + 1}. ${text}`).join('\n\n')}`;

    return await this.analyze(`${systemPrompt}\n\n${userPrompt}`, {
      temperature: 0.3,
      max_tokens: 4000,
    });
  }

  /**
   * 主題分群
   */
  async clusterTopics(
    texts: string[],
    options?: {
      min_topics?: number;
      max_topics?: number;
    },
  ): Promise<any> {
    const systemPrompt = `你是一位資料分析專家，擅長從大量文本中識別主要主題。

請分析以下文本，找出主要主題（${options?.min_topics || 3}-${options?.max_topics || 10} 個）。

請以 JSON 格式回應：
{
  "topics": [
    {
      "topic": "主題名稱",
      "mention_count": 提及次數,
      "percentage": 百分比,
      "keywords": ["關鍵字1", "關鍵字2", ...],
      "sentiment": "overall sentiment",
      "representative_quotes": ["代表性引用1", "代表性引用2"]
    },
    ...
  ],
  "word_cloud": [
    {"word": "詞彙", "weight": 權重},
    ...
  ]
}`;

    const userPrompt = `請分析以下 ${texts.length} 則文本並識別主題：

${texts.map((text, i) => `${i + 1}. ${text}`).join('\n\n')}`;

    return await this.analyze(`${systemPrompt}\n\n${userPrompt}`, {
      temperature: 0.4,
      max_tokens: 4000,
    });
  }

  /**
   * 提取關鍵字
   */
  async extractKeywords(
    texts: string[],
    options?: {
      max_keywords?: number;
    },
  ): Promise<any> {
    const systemPrompt = `請從以下文本中提取最重要的關鍵字（最多 ${options?.max_keywords || 20} 個）。

以 JSON 格式回應：
{
  "keywords": [
    {"keyword": "關鍵字", "frequency": 頻率, "importance": 重要性分數},
    ...
  ]
}`;

    const userPrompt = `文本：\n\n${texts.join('\n\n')}`;

    return await this.analyze(`${systemPrompt}\n\n${userPrompt}`, {
      temperature: 0.3,
      max_tokens: 2000,
    });
  }

  /**
   * 風險偵測
   */
  async detectRisks(
    texts: string[],
    riskKeywords: string[],
  ): Promise<any> {
    const systemPrompt = `你是一位風險分析專家。請檢測以下文本中的風險訊號。

風險關鍵字：${riskKeywords.join(', ')}

以 JSON 格式回應：
{
  "risk_count": 風險數量,
  "risk_percentage": 風險百分比,
  "risks": [
    {
      "text_index": 文本索引,
      "risk_type": "風險類型",
      "severity": "high/medium/low",
      "keywords_found": ["找到的風險詞"],
      "context": "上下文"
    },
    ...
  ]
}`;

    const userPrompt = `請分析以下文本：

${texts.map((text, i) => `${i + 1}. ${text}`).join('\n\n')}`;

    return await this.analyze(`${systemPrompt}\n\n${userPrompt}`, {
      temperature: 0.2,
      max_tokens: 3000,
    });
  }
}
