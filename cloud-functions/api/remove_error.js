const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequest(context) {
  // EdgeOne 函数: 处理 CORS 预检请求 (OPTIONS)
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400"
      },
    });
  }
  try {
    const data = await context.request.json();
    const { userId, questionId } = data;

    if (!userId || !questionId) {
      return new Response(JSON.stringify({ success: false, error: "缺少必要参数" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
        }
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // 将此题目的 is_correct 重置为 1 (标记为正确)，并且取消收藏 (is_bookmarked = 0)
    // 这样该题就不会再出现在错题本的查询结果中了
    await connection.execute(
      `UPDATE user_answers 
       SET is_correct = 1, is_bookmarked = 0 
       WHERE user_id = ? AND question_id = ?`,
      [userId, questionId]
    );

    await connection.end();

    return new Response(JSON.stringify({ success: true, message: "已成功移出错题本" }), {
      headers: { 
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
        }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { 
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
        }
    });
  }
}
