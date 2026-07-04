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
    const { userId, questionId, selectedIndex, isCorrect, isBookmarked } = data;

    if (!userId || !questionId) {
      return new Response(JSON.stringify({ success: false, error: "缺少必要参数 (userId 或 questionId)" }), {
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

    const safeSelectedIndex = selectedIndex === undefined ? null : selectedIndex;
    const safeIsCorrect = isCorrect === undefined ? null : isCorrect;
    const safeIsBookmarked = isBookmarked === undefined ? null : isBookmarked;

    // 记录答题状态
    // 注意：新 schema 中 user_answers 表结构较简单，只有 selected_index, is_correct, is_bookmarked
    await connection.execute(
      `INSERT INTO user_answers (user_id, question_id, selected_index, is_correct, is_bookmarked) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       selected_index = IF(? IS NOT NULL, VALUES(selected_index), selected_index),
       is_correct = IF(? IS NOT NULL, VALUES(is_correct), is_correct),
       is_bookmarked = IF(? IS NOT NULL, VALUES(is_bookmarked), is_bookmarked)`,
      [
        // VALUES
        userId, 
        questionId, 
        safeSelectedIndex, 
        safeIsCorrect, 
        safeIsBookmarked ?? false,
        
        // ON DUPLICATE KEY UPDATE
        safeSelectedIndex, 
        safeIsCorrect,     
        safeIsBookmarked
      ]
    );

    await connection.end();

    return new Response(JSON.stringify({ success: true, message: "记录保存成功" }), {
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
