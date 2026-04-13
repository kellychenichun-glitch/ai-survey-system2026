const express = require('express');
const pool = require('./db');
const initDatabase = require('./init-db');

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
    version: '2.0.0',
    features: ['Database Connected', 'CRUD Operations', 'PostgreSQL'],
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
      create_survey: 'POST /api/surveys',
      update_survey: 'PUT /api/surveys/:id',
      delete_survey: 'DELETE /api/surveys/:id',
      survey_questions: 'GET /api/surveys/:id/questions'
    }
  });
});

// 取得所有問卷
app.get('/api/surveys', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM surveys ORDER BY created_at DESC'
    );
    
    res.json({
      status: 'success',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch surveys',
      error: error.message
    });
  }
});

// 取得單一問卷
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM surveys WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Survey not found'
      });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch survey',
      error: error.message
    });
  }
});

// 建立新問卷
app.post('/api/surveys', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO surveys (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, status || 'draft']
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Survey created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create survey',
      error: error.message
    });
  }
});

// 更新問卷
app.put('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const result = await pool.query(
      `UPDATE surveys 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Survey not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Survey updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update survey',
      error: error.message
    });
  }
});

// 刪除問卷
app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM surveys WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Survey not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Survey deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete survey',
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
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API ready at http://localhost:${PORT}`);
  console.log(`💾 Database connected`);
});
