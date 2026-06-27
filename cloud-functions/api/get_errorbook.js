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

    // 查询错题本数据：包含用户最后一次做错的题 (is_correct = 0) 或主动收藏的题 (is_bookmarked = 1)
    // 并且联合 sub_subjects 获取学科 code
    const [rows] = await connection.execute(
      `SELECT 
         ua.question_id as questionId,
         sub.code as subjectId,
         ua.is_bookmarked as isBookmarked,
         ua.is_correct as isCorrect,
         DATE_FORMAT(ua.last_answered_at, '%Y-%m-%d') as lastWrongAt,
         q.stem,
         sub.name as category
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       JOIN sub_subjects sub ON q.sub_subject_id = sub.id
       WHERE ua.user_id = ? AND (ua.is_correct = 0 OR ua.is_bookmarked = 1)
       ORDER BY ua.last_answered_at DESC`,
      [userId]
    );

    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      data: rows
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
