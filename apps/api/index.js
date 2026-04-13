const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 健康檢查
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'AI Survey System API is running!',
    version: '1.0.0',
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
      surveys: 'GET /api/surveys (coming soon)',
      create_survey: 'POST /api/surveys (coming soon)'
    }
  });
});

// 基本的調查列表端點（模擬數據）
app.get('/api/surveys', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        title: 'Customer Satisfaction Survey',
        status: 'active',
        created_at: '2026-04-13T00:00:00Z'
      },
      {
        id: 2,
        title: 'Product Feedback Survey',
        status: 'draft',
        created_at: '2026-04-13T00:00:00Z'
      }
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API ready at http://localhost:${PORT}`);
});
