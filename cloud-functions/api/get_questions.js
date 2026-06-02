const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequestGet(context) {
  // 从 URL 参数中获取 subjectId
  const url = new URL(context.request.url);
  const subjectId = url.searchParams.get('subjectId');

  if (!subjectId) {
    return new Response(JSON.stringify({ success: false, error: "缺少 subjectId 参数" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 查询该科目下的所有题目
    const [rows] = await connection.execute(
      'SELECT * FROM questions WHERE subject_id = ? ORDER BY created_at ASC',
      [subjectId]
    );

    await connection.end();

    // 格式化数据，确保前端接收到的格式与之前 Mock 数据一致
    const formattedQuestions = rows.map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      category: row.category,
      stem: row.stem,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correctIndex: row.correct_index,
      explanation: row.explanation
    }));

    return new Response(JSON.stringify({
      success: true,
      data: formattedQuestions
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
