const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function generateSurvey(topic, questionCount = 5, language = 'zh-TW') {
  const prompt = '你是一個專業的問卷設計專家。請根據以下主題生成一份問卷：\n\n' +
    '主題：' + topic + '\n' +
    '問題數量：' + questionCount + '\n' +
    '語言：' + language + '\n\n' +
    '請以 JSON 格式回應，不要包含任何其他文字：\n' +
    '1. title: 問卷標題\n' +
    '2. description: 問卷描述\n' +
    '3. questions: 問題陣列，每個問題包含：\n' +
    '   - question: 問題文字\n' +
    '   - type: 問題類型 (rating, choice, text, yes_no)\n' +
    '   - options: 如果是 choice 類型，提供選項陣列\n' +
    '   - required: 是否必填\n\n' +
    '請回傳 JSON，不要加任何其他文字。';

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let responseText = message.content[0].text;
    
    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7);
    } else if (responseText.startsWith('```')) {
      responseText = responseText.substring(3);
    }
    
    if (responseText.endsWith('```')) {
      responseText = responseText.substring(0, responseText.length - 3);
    }
    
    responseText = responseText.trim();
    
    const surveyData = JSON.parse(responseText);
    
    return surveyData;
  } catch (error) {
    console.error('AI 生成錯誤:', error);
    throw new Error('AI 問卷生成失敗：' + error.message);
  }
}

module.exports = {
  generateSurvey
};
