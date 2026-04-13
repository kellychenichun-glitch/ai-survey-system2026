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

// API 說明
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    endpoints: {
      health: 'GET /',
      api_info: 'GET /api',
      surveys_list: 'GET /api/surveys',
      survey_detail: 'GET /api/surveys/:id',
      create_survey: 'POST /api/surveys',
      ai_generate: 'POST /api/surveys/generate (AI功能)',
      update_survey: 'PUT /api/surveys/:id',
      delete_survey: 'DELETE /api/surveys/:id',
      survey_questions: 'GET /api/surveys/:id/questions'
    }
  });
});

// AI 生成問卷
app.post('/api/surveys/generate', async (req, res) => {
  try {
    const { topic, questionCount = 5, language = 'zh-TW' } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        status: 'error',
        message: '請提供問卷主題'
      });
    }

    console.log('生成 AI 問卷: 主題=' + topic + ', 題數=' + questionCount + ', 語言=' + language);
    
    // 呼叫 AI 服務生成問卷
    const surveyData = await generateSurvey(topic, questionCount, language);
    
    // 儲存到資料庫
    const result = await pool.query(
      'INSERT INTO surveys (title, description, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [surveyData.title, surveyData.description]
    );
    
    const survey = result.rows[0];
    
    // 儲存問題
    for (let i = 0; i < surveyData.questions.length; i++) {
      const q = surveyData.questions[i];
      await pool.query(
        'INSERT INTO questions (survey_id, question_text, question_type, options, order_num) VALUES ($1, $2, $3, $4, $5)',
        [survey.id, q.question, q.type, JSON.stringify(q.options || []), i + 1]
      );
    }
    
    res.json({
      status: 'success',
      message: 'AI 問卷生成成功',
      survey: survey,
      ai_generated: true
    });
    
  } catch (error) {
    console.error('AI 生成錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: 'AI 問卷生成失敗',
      error: error.message
    });
  }
});

// 取得所有問卷
app.get('/api/surveys', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json({
      status: 'success',
      count: result.rows.length,
      surveys: result.rows
    });
  } catch (error) {
    console.error('取得問卷錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '取得問卷失敗',
      error: error.message
    });
  }
});

// 取得單一問卷
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM surveys WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該問卷'
      });
    }
    
    res.json({
      status: 'success',
      survey: result.rows[0]
    });
  } catch (error) {
    console.error('取得問卷錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '取得問卷失敗',
      error: error.message
    });
  }
});

// 建立問卷（手動）
app.post('/api/surveys', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: '請提供問卷標題'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO surveys (title, description, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [title, description || '']
    );
    
    res.status(201).json({
      status: 'success',
      message: '問卷建立成功',
      survey: result.rows[0]
    });
  } catch (error) {
    console.error('建立問卷錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '建立問卷失敗',
      error: error.message
    });
  }
});

// 更新問卷
app.put('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    const result = await pool.query(
      'UPDATE surveys SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該問卷'
      });
    }
    
    res.json({
      status: 'success',
      message: '問卷更新成功',
      survey: result.rows[0]
    });
  } catch (error) {
    console.error('更新問卷錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '更新問卷失敗',
      error: error.message
    });
  }
});

// 刪除問卷
app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM surveys WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該問卷'
      });
    }
    
    res.json({
      status: 'success',
      message: '問卷刪除成功',
      survey: result.rows[0]
    });
  } catch (error) {
    console.error('刪除問卷錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '刪除問卷失敗',
      error: error.message
    });
  }
});

// 取得問卷的所有問題
app.get('/api/surveys/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_num',
      [id]
    );
    
    res.json({
      status: 'success',
      count: result.rows.length,
      questions: result.rows
    });
  } catch (error) {
    console.error('取得問題錯誤:', error);
    res.status(500).json({
      status: 'error',
      message: '取得問題失敗',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('AI Survey API 運行於 port ' + PORT);
});
