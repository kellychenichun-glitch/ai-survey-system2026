const express = require('express');
const { Pool } = require('pg');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// ── DB ──────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── Claude ──────────────────────────────────────────
const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// ── Middleware ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Migration ────────────────────────────────────────
async function migrate() {
  const client = await pool.connect();
  try {
    // surveys 主表
    await client.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id            SERIAL PRIMARY KEY,
        title         VARCHAR(255) NOT NULL DEFAULT '未命名問卷',
        description   TEXT DEFAULT '',
        status        VARCHAR(50) DEFAULT 'draft',
        questions     JSONB DEFAULT '[]',
        settings      JSONB DEFAULT '{"allowAnonymous":true,"showProgressBar":true,"randomizeQuestions":false,"thankYouMessage":"謝謝你的填答！"}',
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW(),
        published_at  TIMESTAMPTZ,
        closed_at     TIMESTAMPTZ
      )
    `);

    // 補舊表缺少的欄位（safe — 若已存在會忽略）
    const alterCols = [
      `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS questions    JSONB DEFAULT '[]'`,
      `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS settings     JSONB DEFAULT '{"allowAnonymous":true,"showProgressBar":true,"randomizeQuestions":false,"thankYouMessage":"謝謝你的填答！"}'`,
      `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`,
      `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS closed_at    TIMESTAMPTZ`,
      `ALTER TABLE surveys ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT NOW()`,
    ];
    for (const sql of alterCols) {
      await client.query(sql).catch(() => {});
    }

    // responses 填答記錄
    // 補 responses 缺少欄位（若表已存在但缺欄位）
    const alterResp = [
      `ALTER TABLE responses ADD COLUMN IF NOT EXISTS answers          JSONB DEFAULT '[]'`,
      `ALTER TABLE responses ADD COLUMN IF NOT EXISTS respondent_email VARCHAR(255)`,
      `ALTER TABLE responses ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0`,
      `ALTER TABLE responses ADD COLUMN IF NOT EXISTS status           VARCHAR(20) DEFAULT 'completed'`,
    ];
    for (const sql of alterResp) await client.query(sql).catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id               SERIAL PRIMARY KEY,
        survey_id        INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        answers          JSONB DEFAULT '[]',
        respondent_email VARCHAR(255),
        duration_seconds INTEGER DEFAULT 0,
        status           VARCHAR(20) DEFAULT 'completed',
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    console.log('✅ Migration done');
  } finally {
    client.release();
  }
}

// ── Helper ───────────────────────────────────────────
const ok  = (res, data, code = 200) => res.status(code).json({ status: 'success', ...data });
const err = (res, msg, code = 500) => res.status(code).json({ status: 'error', message: msg });

// ═══════════════════════════════════════════════════
//  HEALTH
// ═══════════════════════════════════════════════════
app.get('/', (_, res) => ok(res, {
  message: 'AI Survey API v3 running',
  version: '3.0.0',
  endpoints: [
    'GET  /api/v1/surveys',
    'GET  /api/v1/surveys/summary',
    'POST /api/v1/surveys',
    'GET  /api/v1/surveys/:id',
    'PUT  /api/v1/surveys/:id',
    'DELETE /api/v1/surveys/:id',
    'POST /api/v1/surveys/:id/publish',
    'POST /api/v1/surveys/:id/close',
    'POST /api/v1/surveys/:id/reopen',
    'POST /api/v1/surveys/:id/duplicate',
    'GET  /api/v1/surveys/public/:id',
    'POST /api/v1/surveys/:id/responses',
    'GET  /api/v1/surveys/:id/stats',
    'GET  /api/v1/surveys/:id/responses/export',
    'POST /api/v1/surveys/ai-generate',
    'GET  /api/v1/chat (legacy)',
  ],
}));

// ═══════════════════════════════════════════════════
//  SURVEYS — 管理端
// ═══════════════════════════════════════════════════

// 清單（含統計摘要）
app.get('/api/v1/surveys/summary', async (req, res) => {
  try {
    const { status, search, sortBy = 'updated_at', sortDir = 'desc' } = req.query;
    const allowed = { updated_at: 's.updated_at', created_at: 's.created_at', title: 's.title', responseCount: 'response_count' };
    const col = allowed[sortBy] || 's.updated_at';
    const dir = sortDir === 'asc' ? 'ASC' : 'DESC';

    const params = [];
    let where = 'WHERE 1=1';
    if (status) { params.push(status); where += ` AND s.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (s.title ILIKE $${params.length} OR s.description ILIKE $${params.length})`; }

    const { rows } = await pool.query(`
      SELECT
        s.id, s.title, s.description, s.status,
        s.created_at, s.updated_at, s.published_at, s.closed_at,
        COALESCE(jsonb_array_length(s.questions), 0) AS "questionCount",
        COUNT(r.id)::int                              AS "responseCount"
      FROM surveys s
      LEFT JOIN responses r ON r.survey_id = s.id
      ${where}
      GROUP BY s.id
      ORDER BY ${col} ${dir}
    `, params);

    ok(res, { surveys: rows });
  } catch (e) { err(res, e.message); }
});

// AI 生成（路徑要在 :id 前，否則被搶匹配）
app.post('/api/v1/surveys/ai-generate', async (req, res) => {
  try {
    const { topic, targetCount = 8, language = 'zh-TW', context = '', preferredTypes } = req.body;
    if (!topic) return err(res, '請提供問卷主題', 400);

    const typesHint = preferredTypes?.length
      ? `偏好題型：${preferredTypes.join(', ')}，但可視主題彈性調整。`
      : '混合使用 single_choice、rating、text_long 等題型。';

    const prompt = `你是專業問卷設計師。請根據以下需求設計一份完整的問卷。

主題：${topic}
題目數量：${targetCount} 題
語言：${language}
${context ? `補充說明：${context}` : ''}
${typesHint}

請回傳 JSON 格式（嚴格遵守，不要加任何額外文字）：
{
  "title": "問卷標題",
  "description": "向受訪者說明的簡介（1-2 句）",
  "questions": [
    {
      "id": "q1",
      "type": "single_choice",
      "title": "題目文字",
      "description": "",
      "required": true,
      "order": 0,
      "options": [{"id":"o1","text":"選項1"},{"id":"o2","text":"選項2"}]
    }
  ]
}

題型規則：
- single_choice / multi_choice：必須有 options 陣列（3-5 個選項）
- rating：加上 scale(5 或 10)、style("stars"/"numbers"/"nps")、minLabel、maxLabel
- text_short / text_long：加上 placeholder
- matrix：加上 rows 和 columns 陣列
- ranking：加上 items 陣列
- 最後 1-2 題建議放 text_long 或 rating 收集開放意見
只回傳 JSON，不要其他說明文字。`;

    const message = await claude.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,'');
    const generated = JSON.parse(raw);
    ok(res, generated);
  } catch (e) { err(res, `AI 生成失敗：${e.message}`); }
});

// 公開填答（不需登入）
app.get('/api/v1/surveys/public/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM surveys WHERE id=$1', [req.params.id]);
    if (!rows.length) return err(res, '找不到問卷', 404);
    if (rows[0].status !== 'published') return err(res, '問卷未發布', 403);
    ok(res, { survey: rows[0] });
  } catch (e) { err(res, e.message); }
});

// 列出所有問卷
app.get('/api/v1/surveys', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM surveys ORDER BY updated_at DESC');
    ok(res, { surveys: rows, count: rows.length });
  } catch (e) { err(res, e.message); }
});

// 取得單一問卷
app.get('/api/v1/surveys/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM surveys WHERE id=$1', [req.params.id]);
    if (!rows.length) return err(res, '找不到問卷', 404);
    ok(res, { survey: rows[0] });
  } catch (e) { err(res, e.message); }
});

// 建立問卷
app.post('/api/v1/surveys', async (req, res) => {
  try {
    const { title = '未命名問卷', description = '', questions = [], settings = {}, status = 'draft' } = req.body;
    const defaultSettings = {
      allowAnonymous: true, showProgressBar: true,
      randomizeQuestions: false, thankYouMessage: '謝謝你的填答！',
      ...settings,
    };
    const { rows } = await pool.query(
      `INSERT INTO surveys (title,description,questions,settings,status,updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
      [title, description, JSON.stringify(questions), JSON.stringify(defaultSettings), status]
    );
    ok(res, { survey: rows[0] }, 201);
  } catch (e) { err(res, e.message); }
});

// 更新問卷
app.put('/api/v1/surveys/:id', async (req, res) => {
  try {
    const { title, description, questions, settings, status } = req.body;
    const { rows: cur } = await pool.query('SELECT * FROM surveys WHERE id=$1', [req.params.id]);
    if (!cur.length) return err(res, '找不到問卷', 404);
    const s = cur[0];
    const { rows } = await pool.query(
      `UPDATE surveys SET
        title=$1, description=$2, questions=$3, settings=$4, status=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [
        title       ?? s.title,
        description ?? s.description,
        JSON.stringify(questions ?? s.questions ?? []),
        JSON.stringify(settings  ?? s.settings  ?? {}),
        status      ?? s.status,
        req.params.id,
      ]
    );
    ok(res, { survey: rows[0] });
  } catch (e) { err(res, e.message); }
});

// 刪除問卷
app.delete('/api/v1/surveys/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM surveys WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows.length) return err(res, '找不到問卷', 404);
    ok(res, { deleted: rows[0].id });
  } catch (e) { err(res, e.message); }
});

// 發布
app.post('/api/v1/surveys/:id/publish', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE surveys SET status='published', published_at=NOW(), updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return err(res, '找不到問卷', 404);
    ok(res, { survey: rows[0] });
  } catch (e) { err(res, e.message); }
});

// 關閉
app.post('/api/v1/surveys/:id/close', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE surveys SET status='closed', closed_at=NOW(), updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return err(res, '找不到問卷', 404);
    ok(res, { survey: rows[0] });
  } catch (e) { err(res, e.message); }
});

// 重新開啟
app.post('/api/v1/surveys/:id/reopen', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE surveys SET status='published', closed_at=NULL, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return err(res, '找不到問卷', 404);
    ok(res, { survey: rows[0] });
  } catch (e) { err(res, e.message); }
});

// 複製問卷
app.post('/api/v1/surveys/:id/duplicate', async (req, res) => {
  try {
    const { rows: src } = await pool.query('SELECT * FROM surveys WHERE id=$1', [req.params.id]);
    if (!src.length) return err(res, '找不到問卷', 404);
    const s = src[0];
    const { rows } = await pool.query(
      `INSERT INTO surveys (title,description,questions,settings,status,updated_at)
       VALUES ($1,$2,$3,$4,'draft',NOW()) RETURNING *`,
      [`${s.title} (副本)`, s.description, JSON.stringify(s.questions ?? []), JSON.stringify(s.settings ?? {})]
    );
    ok(res, { survey: rows[0] }, 201);
  } catch (e) { err(res, e.message); }
});

// ═══════════════════════════════════════════════════
//  RESPONSES — 填答
// ═══════════════════════════════════════════════════

app.post('/api/v1/surveys/:id/responses', async (req, res) => {
  try {
    const { answers = [], respondentEmail, durationSeconds = 0 } = req.body;
    // 確認問卷存在且已發布
    const { rows: sv } = await pool.query('SELECT id,status,settings FROM surveys WHERE id=$1', [req.params.id]);
    if (!sv.length) return err(res, '找不到問卷', 404);
    if (sv[0].status !== 'published') return err(res, '問卷未開放填答', 403);

    const { rows } = await pool.query(
      `INSERT INTO responses (survey_id,answers,respondent_email,duration_seconds,status)
       VALUES ($1,$2,$3,$4,'completed') RETURNING id`,
      [req.params.id, JSON.stringify(answers), respondentEmail || null, durationSeconds]
    );
    const settings = sv[0].settings || {};
    ok(res, {
      id: rows[0].id,
      thankYouMessage: settings.thankYouMessage || '謝謝你的填答！',
    }, 201);
  } catch (e) { err(res, e.message); }
});

// ═══════════════════════════════════════════════════
//  STATS — 統計分析
// ═══════════════════════════════════════════════════

app.get('/api/v1/surveys/:id/stats', async (req, res) => {
  try {
    const { rows: sv } = await pool.query('SELECT * FROM surveys WHERE id=$1', [req.params.id]);
    if (!sv.length) return err(res, '找不到問卷', 404);
    const survey = sv[0];

    const { rows: resp } = await pool.query(
      `SELECT answers, duration_seconds, created_at FROM responses WHERE survey_id=$1`,
      [req.params.id]
    );

    const total = resp.length;
    const avgDuration = total
      ? Math.round(resp.reduce((s, r) => s + (r.duration_seconds || 0), 0) / total)
      : 0;

    const questions = survey.questions || [];
    const questionStats = questions.map((q) => {
      const allAnswers = resp
        .map(r => (r.answers || []).find(a => a.questionId === q.id))
        .filter(Boolean);

      let stats = { type: q.type, totalAnswers: allAnswers.length };

      if (q.type === 'single_choice') {
        const counts = {};
        allAnswers.forEach(a => {
          const id = a.value?.optionId;
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
        stats.optionCounts = counts;
      } else if (q.type === 'multi_choice') {
        const counts = {};
        allAnswers.forEach(a => {
          (a.value?.optionIds || []).forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
          });
        });
        stats.optionCounts = counts;
      } else if (q.type === 'rating') {
        const vals = allAnswers.map(a => Number(a.value?.value)).filter(n => !isNaN(n));
        const dist = {};
        vals.forEach(v => { dist[v] = (dist[v] || 0) + 1; });
        const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
        stats.average = Math.round(avg * 100) / 100;
        stats.distribution = dist;
        if (q.style === 'nps') {
          const promoters  = vals.filter(v => v >= 9).length;
          const detractors = vals.filter(v => v <= 6).length;
          const passives   = vals.length - promoters - detractors;
          stats.nps         = vals.length ? Math.round(((promoters - detractors) / vals.length) * 100) : 0;
          stats.promoters   = promoters;
          stats.passives    = passives;
          stats.detractors  = detractors;
        }
      } else if (q.type === 'text_short' || q.type === 'text_long') {
        stats.answers = allAnswers
          .filter(a => a.value?.text?.trim())
          .map(a => ({ responseId: String(a.questionId), text: a.value.text, createdAt: new Date().toISOString() }))
          .slice(0, 200);
      } else if (q.type === 'matrix') {
        const cells = {};
        allAnswers.forEach(a => {
          Object.entries(a.value?.rows || {}).forEach(([rowId, colId]) => {
            if (!cells[rowId]) cells[rowId] = {};
            const ids = Array.isArray(colId) ? colId : [colId];
            ids.forEach(c => { cells[rowId][c] = (cells[rowId][c] || 0) + 1; });
          });
        });
        stats.cellCounts = cells;
      } else if (q.type === 'ranking') {
        const sums = {};
        allAnswers.forEach(a => {
          (a.value?.orderedItemIds || []).forEach((id, i) => {
            if (!sums[id]) sums[id] = { total: 0, count: 0 };
            sums[id].total += i + 1;
            sums[id].count += 1;
          });
        });
        const ranks = {};
        Object.entries(sums).forEach(([id, { total, count }]) => {
          ranks[id] = Math.round((total / count) * 100) / 100;
        });
        stats.averageRanks = ranks;
      } else if (q.type === 'voice') {
        stats.totalRecordings = allAnswers.filter(a => a.value?.audioUrl).length;
        stats.avgDurationSec = allAnswers.length
          ? Math.round(allAnswers.reduce((s, a) => s + (a.value?.duration || 0), 0) / allAnswers.length)
          : 0;
        stats.recordings = allAnswers.map(a => ({
          responseId: String(a.questionId),
          audioUrl: a.value?.audioUrl || '',
          duration: a.value?.duration || 0,
          transcript: a.value?.transcript,
          createdAt: new Date().toISOString(),
        }));
      }

      return { questionId: q.id, question: q, stats };
    });

    ok(res, {
      surveyId: String(req.params.id),
      totalResponses: total,
      completionRate: total > 0 ? 1 : 0,
      avgDurationSeconds: avgDuration,
      questions: questionStats,
    });
  } catch (e) { err(res, e.message); }
});

// CSV 匯出
app.get('/api/v1/surveys/:id/responses/export', async (req, res) => {
  try {
    const { rows: sv } = await pool.query('SELECT * FROM surveys WHERE id=$1', [req.params.id]);
    if (!sv.length) return err(res, '找不到問卷', 404);
    const survey = sv[0];
    const questions = survey.questions || [];

    const { rows: resp } = await pool.query(
      `SELECT id, answers, respondent_email, duration_seconds, created_at
       FROM responses WHERE survey_id=$1 ORDER BY created_at DESC`,
      [req.params.id]
    );

    const headers = ['response_id', 'email', 'duration_sec', 'submitted_at',
      ...questions.map((q, i) => `Q${i+1}_${(q.title || '').slice(0,30).replace(/,/g, '，')}`)
    ];

    const csvRows = [headers.join(',')];
    resp.forEach(r => {
      const cells = [
        r.id, r.respondent_email || '', r.duration_seconds || 0,
        new Date(r.created_at).toLocaleString('zh-TW'),
        ...questions.map(q => {
          const ans = (r.answers || []).find(a => a.questionId === q.id);
          if (!ans?.value) return '';
          const v = ans.value;
          if (v.optionId)      return `"${v.optionId}"`;
          if (v.optionIds)     return `"${v.optionIds.join('|')}"`;
          if (v.text != null)  return `"${String(v.text).replace(/"/g, '""')}"`;
          if (v.value != null) return v.value;
          if (v.orderedItemIds) return `"${v.orderedItemIds.join('>')}"`;
          if (v.audioUrl)      return `"${v.audioUrl}"`;
          return '';
        }),
      ];
      csvRows.push(cells.join(','));
    });

    const csv = '\uFEFF' + csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="survey_${req.params.id}.csv"`);
    res.send(csv);
  } catch (e) { err(res, e.message); }
});

// ═══════════════════════════════════════════════════
//  LEGACY CHAT (前端 /chat 頁面用)
// ═══════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message) return err(res, '請提供訊息', 400);

    const messages = [
      ...conversationHistory.slice(-10),
      { role: 'user', content: message },
    ];

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: '你是一個友善的 AI 客服助手，使用繁體中文回答，簡潔清楚。',
      messages,
    });

    ok(res, {
      message: response.content[0].text,
      conversationHistory: [...messages, { role: 'assistant', content: response.content[0].text }],
    });
  } catch (e) { err(res, e.message); }
});

// ── 啟動 ─────────────────────────────────────────────
migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 AI Survey API v3 on port ${PORT}`));
  })
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  });
