const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { userId, questionId, subjectId, selectedIndex, isCorrect, isBookmarked } = data;

    if (!userId || !questionId) {
      return new Response(JSON.stringify({ success: false, error: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // 使用 ON DUPLICATE KEY UPDATE 处理更新或插入
    await connection.execute(
      `INSERT INTO user_answers (user_id, question_id, subject_id, selected_index, is_correct, is_bookmarked, wrong_count) 
       VALUES (?, ?, ?, ?, ?, ?, IF(? = false, 1, 0))
       ON DUPLICATE KEY UPDATE 
       selected_index = VALUES(selected_index),
       is_correct = VALUES(is_correct),
       is_bookmarked = IF(? IS NOT NULL, ?, is_bookmarked),
       wrong_count = wrong_count + IF(VALUES(is_correct) = false, 1, 0)`,
      [
        userId, questionId, subjectId || '', selectedIndex ?? -1, isCorrect ?? false, isBookmarked ?? false, isCorrect,
        isBookmarked, isBookmarked
      ]
    );

    await connection.end();

    return new Response(JSON.stringify({ success: true, message: "记录保存成功" }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
