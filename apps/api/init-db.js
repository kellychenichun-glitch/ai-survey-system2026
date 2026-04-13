const pool = require('./db');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Building tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ surveys table created');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        options JSONB,
        required BOOLEAN DEFAULT false,
        order_num INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ questions table created');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        response_text TEXT,
        respondent_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ responses table created');
    
    const result = await client.query('SELECT COUNT(*) FROM surveys');
    if (result.rows[0].count === '0') {
      await client.query(`
        INSERT INTO surveys (title, description, status) VALUES
        ('Customer Satisfaction Survey', 'Tell us about your experience', 'active'),
        ('Product Feedback Survey', 'Help us improve our products', 'draft');
      `);
      
      await client.query(`
        INSERT INTO questions (survey_id, question_text, question_type, required, order_num) VALUES
        (1, 'How satisfied are you with our service?', 'rating', true, 1),
        (1, 'What can we improve?', 'text', false, 2),
        (2, 'Which product did you use?', 'choice', true, 1);
      `);
      
      console.log('✅ Test data inserted');
    }
    
    console.log('🎉 Database initialized!');
    
  } catch (error) {
    console.error('❌ Database error:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initDatabase;
