const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: "缺少 userId 参数" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT n.id, n.question_id, n.subject_id, n.content, n.updated_at, q.category, q.stem 
       FROM question_notes n 
       JOIN questions q ON n.question_id = q.id 
       WHERE n.user_id = ? 
       ORDER BY n.updated_at DESC`,
      [userId]
    );

    await connection.end();

    const formattedNotes = rows.map(row => ({
      id: row.id,
      questionId: row.question_id,
      subjectId: row.subject_id,
      category: row.category,
      stem: row.stem,
      content: row.content,
      updatedAt: row.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      data: formattedNotes
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
