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

    const safeSelectedIndex = selectedIndex === undefined ? null : selectedIndex;
    const safeIsCorrect = isCorrect === undefined ? null : isCorrect;
    const safeIsBookmarked = isBookmarked === undefined ? null : isBookmarked;

    // 1. 记录总体的答题状态和错题次数
    await connection.execute(
      `INSERT INTO user_answers (user_id, question_id, subject_id, selected_index, is_correct, is_bookmarked, wrong_count) 
       VALUES (?, ?, ?, ?, ?, ?, IF(? = true, 1, 0))
       ON DUPLICATE KEY UPDATE 
       selected_index = IF(? IS NOT NULL, VALUES(selected_index), selected_index),
       is_correct = IF(? IS NOT NULL, VALUES(is_correct), is_correct),
       is_bookmarked = IF(? IS NOT NULL, VALUES(is_bookmarked), is_bookmarked),
       wrong_count = wrong_count + IF(? IS NOT NULL AND VALUES(is_correct) = false, 1, 0)`,
      [
        // VALUES
        userId, 
        questionId, 
        subjectId || '', 
        safeSelectedIndex, 
        safeIsCorrect, 
        safeIsBookmarked ?? false, // 插入时默认为 false
        safeIsCorrect === false, // wrong_count initial condition (is_correct = false)
        
        // ON DUPLICATE KEY UPDATE
        safeSelectedIndex, 
        safeIsCorrect,     
        safeIsBookmarked,  
        safeIsCorrect      
      ]
    );

    // 2. 插入一条练习流水日志，用于统计“今日刷题”和“本周趋势”
    // 注意：如果只是修改 isBookmarked 状态（没有传入 selectedIndex），我们不应该记录为一次“练习”
    if (selectedIndex !== undefined && selectedIndex !== null) {
      await connection.execute(
        `INSERT INTO practice_logs (user_id, question_id, is_correct) VALUES (?, ?, ?)`,
        [userId, questionId, isCorrect ? 1 : 0]
      );
    }

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