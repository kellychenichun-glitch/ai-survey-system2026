#!/bin/bash

echo "🔍 檢查 AI Survey API 端點..."
echo "================================"
echo ""

# 1. 檢查主頁
echo "1️⃣  檢查主頁 (GET /)"
echo "URL: https://ai-survey-api.onrender.com"
curl -s https://ai-survey-api.onrender.com | jq '.'
echo ""
echo "================================"
echo ""

# 2. 檢查 API 文檔
echo "2️⃣  檢查 API 文檔 (GET /api)"
echo "URL: https://ai-survey-api.onrender.com/api"
curl -s https://ai-survey-api.onrender.com/api | jq '.'
echo ""
echo "================================"
echo ""

# 3. 檢查問卷列表
echo "3️⃣  檢查問卷列表 (GET /api/surveys)"
echo "URL: https://ai-survey-api.onrender.com/api/surveys"
curl -s https://ai-survey-api.onrender.com/api/surveys | jq '.'
echo ""
echo "================================"
echo ""

# 4. 測試 AI 生成（這會實際調用 Claude API）
echo "4️⃣  測試 AI 生成問卷 (POST /api/surveys/generate)"
echo "URL: https://ai-survey-api.onrender.com/api/surveys/generate"
echo "請求內容: {topic: '測試問卷', questionCount: 3}"
curl -s -X POST https://ai-survey-api.
cd ~/Downloads/ai-survey-system/apps/api

cat > ai-service.js << 'EOF'
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

請直接回傳 JSON，不要加任何其他文字或 Markdown 標記。`;

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
    
    // 清理響應文本：移除 Markdown 代碼塊標記
    responseText = responseText.trim();
    
    // 移除開頭的 ```json 或 ```
    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7);
    } else if (responseText.startsWith('```')) {
      responseText = responseText.substring(3);
    }
    
    // 移除結尾的 ```
    if (responseText.endsWith('```')) {
      responseText = responseText.substring(0, responseText.length - 3);
    }
    
    // 再次修剪空白
    responseText = responseText.trim();
    
    // 解析 JSON
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
