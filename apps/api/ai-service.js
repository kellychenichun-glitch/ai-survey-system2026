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
   - text: 問題文字
   - type: 問題類型 (rating, choice, text, yes_no)
   - options: 如果是 choice 類型，提供選項陣列
   - required: 是否必填 (true/false)

範例格式：
{
  "title": "客戶滿意度調查",
  "description": "幫助我們了解您的體驗",
  "questions": [
    {
      "text": "您對我們的服務滿意嗎？",
      "type": "rating",
      "required": true
    },
    {
      "text": "您最喜歡我們的哪項服務？",
      "type": "choice",
      "options": ["產品品質", "客戶服務", "價格", "配送速度"],
      "required": true
    }
  ]
}

請直接回傳 JSON，不要加任何其他文字。`;

  try {
    cons
# 備份現有的 index.js
cp index.js index-backup.js

# 在 index.js 最上方加入 AI 服務
cat > index-temp.js << 'EOF'
const express = require('express');
const pool = require('./db');
const initDatabase = require('./init-db');
const { generateSurvey } = require('./ai-service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 啟動時初始化資料庫
initDatabase().catch(console.error);

// 健康檢查
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'AI Survey System API is running!',
    version: '2.1.0',
    features: ['Database Connected', 'CRUD Operations', 'PostgreSQL', 'AI Survey Generation'],
    timestamp: new Date().toISOString()
  });
});

// API 文檔
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    endpoints: {
      health: 'GET /',
      api_info: 'GET /api',
      surveys_list: 'GET /api/surveys',
      survey_detail: 'GET /api/surveys/:id',
      create_survey: 'POST /api/surveys'
cat > package.json << 'EOF'
{
  "name": "ai-survey-api",
  "version": "2.1.0",
  "description": "AI Survey System API with PostgreSQL and Claude AI",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "@anthropic-ai/sdk": "^0.32.1"
  }
}
