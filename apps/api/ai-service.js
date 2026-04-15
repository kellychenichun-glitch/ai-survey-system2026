const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/**
 * 清理 Claude API 返回的 Markdown 格式 JSON
 * 移除 ```json 和 ``` 標記
 */
function cleanMarkdownJson(text) {
  if (!text) return text;
  
  // 移除開頭的 ```json 或 ```
  let cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '');
  
  // 移除結尾的 ```
  cleaned = cleaned.replace(/\s*```\s*$/, '');
  
  return cleaned.trim();
}

/**
 * 使用 Claude AI 生成問卷題目
 */
async function generateSurveyQuestions(topic, questionCount = 5, language = 'zh-TW') {
  try {
    const prompt = "請根據以下主題生成 " + questionCount + " 個問卷問題。\n\n主題: " + topic + "\n語言: " + language + "\n題目數量: " + questionCount + "\n\n請以 JSON 格式回覆,格式如下:\n{\n  \"questions\": [\n    {\n      \"id\": 1,\n      \"text\": \"問題文字\",\n      \"type\": \"single_choice\",\n      \"options\": [\"選項1\", \"選項2\", \"選項3\", \"選項4\"]\n    }\n  ]\n}\n\n題目類型可以是:\n- single_choice: 單選題\n- multiple_choice: 多選題\n- text: 文字題\n- rating: 評分題 (1-5)\n\n請確保:\n1. 問題清晰且易於理解\n2. 選項互斥且完整\n3. 適合調查目標受眾\n4. 使用指定語言\n\n只回傳 JSON,不要其他說明文字。";

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const cleanedText = cleanMarkdownJson(responseText);
    const result = JSON.parse(cleanedText);
    
    return result.questions || [];
  } catch (error) {
    console.error('AI 生成問卷失敗:', error);
    throw new Error('AI 生成問卷失敗: ' + error.message);
  }
}

/**
 * 分析問卷回覆
 */
async function analyzeSurveyResponses(responses) {
  try {
    const prompt = "請分析以下問卷回覆資料,提供統計分析和洞察:\n\n" + JSON.stringify(responses, null, 2) + "\n\n請以 JSON 格式回覆,包含:\n{\n  \"summary\": \"整體摘要\",\n  \"insights\": [\"洞察1\", \"洞察2\", \"洞察3\"],\n  \"recommendations\": [\"建議1\", \"建議2\"]\n}\n\n只回傳 JSON,不要其他說明文字。";

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const cleanedText = cleanMarkdownJson(responseText);
    const result = JSON.parse(cleanedText);
    
    return result;
  } catch (error) {
    console.error('AI 分析失敗:', error);
    throw new Error('AI 分析失敗: ' + error.message);
  }
}

module.exports = {
  generateSurveyQuestions,
  analyzeSurveyResponses,
  cleanMarkdownJson,
};
