const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db',
  connectionLimit: 1,
  connectTimeout: 5000
};

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export default async function onRequestPost(context) {
  try {
    const request = context.request;
    const data = await request.json();

    const { userId, questionId, subjectId, content } = data;

    if (!userId || !questionId || !subjectId) {
      return new Response(JSON.stringify({ success: false, error: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const connection = await getPool().getConnection();

    if (content === undefined || content.trim() === '') {
      // 删除笔记
      await connection.execute(
        'DELETE FROM question_notes WHERE user_id = ? AND question_id = ?',
        [userId, questionId]
      );
    } else {
      // 插入或更新笔记
      await connection.execute(
        `INSERT INTO question_notes (user_id, question_id, subject_id, content) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE content = ?, updated_at = CURRENT_TIMESTAMP`,
        [userId, questionId, subjectId, content, content]
      );
    }

    connection.release();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
