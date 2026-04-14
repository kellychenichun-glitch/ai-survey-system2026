const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function generateSurvey(topic, questionCount = 5, language = 'zh-TW') {
  const prompt = `你是一個專業的問卷設計專家。請根據以下主題生成一份問卷：

主題：${topic}
問題數量：${questionCount}
語言：${language}

請以 JSON 格式回應，包含：
1. title: 問卷標題
2. description: 問卷描述
3. questions: 問題陣列，每個問題包含：
  - question: 問題文字
  - type: 問題類型 (rating, choice, text, yes_no)
  - options: 如果是 choice 類型，提供選項陣列
  - required: 是否必填 (true/false)

請直接回傳 JSON，不要加任何其他文字。`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const surveyData = JSON.parse(responseText);
    
    return surveyData;
  } catch (error) {
    console.error('AI 生成錯誤:', error);
    throw new Error('AI 問卷生成失敗: ' + error.message);
  }
}

module.exports = {
  generateSurvey
};
