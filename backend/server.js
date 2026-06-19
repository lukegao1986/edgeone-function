const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 允许所有来源跨域
app.use(express.json()); // 解析 JSON 请求体

// 数据库配置
// 优先使用环境变量中的配置，如果没有则使用默认的公网配置（用于本地开发）
const dbConfig = {
  host: process.env.DB_HOST || 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: process.env.DB_PORT || 24547,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2199wlmm!',
  database: process.env.DB_NAME || 'shuati_db'
};

// --- API 路由开始 ---

// 1. 获取题目 (get_questions)
app.get('/api/get_questions', async (req, res) => {
  const subjectId = req.query.subjectId;
  const userId = req.query.userId;

  if (!subjectId) {
    return res.status(400).json({ success: false, error: "缺少 subjectId 参数" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM questions WHERE subject_id = ? ORDER BY created_at ASC',
      [subjectId]
    );

    let userAnswers = {};
    let userNotes = {};
    if (userId) {
      const [ansRows] = await connection.execute(
        'SELECT question_id, selected_index, is_correct, is_bookmarked FROM user_answers WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
      );
      ansRows.forEach(row => {
        userAnswers[row.question_id] = {
          selectedIndex: row.selected_index,
          isCorrect: Boolean(row.is_correct),
          isBookmarked: Boolean(row.is_bookmarked)
        };
      });

      const [noteRows] = await connection.execute(
        'SELECT question_id, content, updated_at FROM question_notes WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
      );
      noteRows.forEach(row => {
        userNotes[row.question_id] = {
          content: row.content,
          updatedAt: row.updated_at
        };
      });
    }

    const formattedQuestions = rows.map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      category: row.category,
      stem: row.stem,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correctIndex: row.correct_index,
      explanation: row.explanation
    }));

    res.json({
      success: true,
      data: formattedQuestions,
      userAnswers,
      userNotes
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, error: "数据库错误: " + err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 2. 提交答案 (submit_answer)
app.post('/api/submit_answer', async (req, res) => {
  const { userId, questionId, subjectId, selectedIndex, isCorrect, isBookmarked } = req.body;

  if (!userId || !questionId) {
    return res.status(400).json({ success: false, error: "缺少必要参数" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const safeSelectedIndex = selectedIndex === undefined ? null : selectedIndex;
    const safeIsCorrect = isCorrect === undefined ? null : isCorrect;
    const safeIsBookmarked = isBookmarked === undefined ? null : isBookmarked;

    await connection.execute(
      `INSERT INTO user_answers (user_id, question_id, subject_id, selected_index, is_correct, is_bookmarked, wrong_count) 
       VALUES (?, ?, ?, ?, ?, ?, IF(? = true, 1, 0))
       ON DUPLICATE KEY UPDATE 
       selected_index = IF(? IS NOT NULL, VALUES(selected_index), selected_index),
       is_correct = IF(? IS NOT NULL, VALUES(is_correct), is_correct),
       is_bookmarked = IF(? IS NOT NULL, VALUES(is_bookmarked), is_bookmarked),
       wrong_count = wrong_count + IF(? IS NOT NULL AND VALUES(is_correct) = false, 1, 0)`,
      [
        userId, questionId, subjectId || '', safeSelectedIndex, safeIsCorrect, safeIsBookmarked ?? false, safeIsCorrect === false,
        safeSelectedIndex, safeIsCorrect, safeIsBookmarked, safeIsCorrect      
      ]
    );

    if (selectedIndex !== undefined && selectedIndex !== null) {
      await connection.execute(
        `INSERT INTO practice_logs (user_id, question_id, is_correct) VALUES (?, ?, ?)`,
        [userId, questionId, isCorrect ? 1 : 0]
      );
    }

    res.json({ success: true, message: "记录保存成功" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, error: "数据库错误: " + err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 3. 提交笔记 (submit_note)
app.post('/api/submit_note', async (req, res) => {
  const { userId, questionId, subjectId, content } = req.body;

  if (!userId || !questionId || !subjectId) {
    return res.status(400).json({ success: false, error: "缺少必要参数" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    if (content === undefined || content.trim() === '') {
      await connection.execute(
        'DELETE FROM question_notes WHERE user_id = ? AND question_id = ?',
        [userId, questionId]
      );
    } else {
      await connection.execute(
        `INSERT INTO question_notes (user_id, question_id, subject_id, content) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE content = ?, updated_at = CURRENT_TIMESTAMP`,
        [userId, questionId, subjectId, content, content]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, error: "数据库错误: " + err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 4. 获取笔记列表 (get_notes_list)
app.get('/api/get_notes_list', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: "缺少 userId 参数" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT n.id, n.question_id, n.subject_id, n.content, n.updated_at, q.category, q.stem 
       FROM question_notes n 
       JOIN questions q ON n.question_id = q.id 
       WHERE n.user_id = ? 
       ORDER BY n.updated_at DESC`,
      [userId]
    );

    const formattedNotes = rows.map(row => ({
      id: row.id,
      questionId: row.question_id,
      subjectId: row.subject_id,
      category: row.category,
      stem: row.stem,
      content: row.content,
      updatedAt: row.updated_at
    }));

    res.json({ success: true, data: formattedNotes });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, error: "数据库错误: " + err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EJU Pro Backend is running!' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
