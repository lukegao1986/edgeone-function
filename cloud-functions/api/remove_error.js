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
    const { userId, questionId } = data;

    if (!userId || !questionId) {
      return new Response(JSON.stringify({ success: false, error: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // 将此题目的 wrong_count 重置为 0，并且取消收藏 (is_bookmarked = 0)
    // 这样该题就不会再出现在错题本的查询结果中了
    await connection.execute(
      `UPDATE user_answers 
       SET wrong_count = 0, is_bookmarked = 0 
       WHERE user_id = ? AND question_id = ?`,
      [userId, questionId]
    );

    await connection.end();

    return new Response(JSON.stringify({ success: true, message: "已成功移出错题本" }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
