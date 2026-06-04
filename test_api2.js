const mysql = require('mysql2/promise');
async function test() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });
  
  try {
    // 模拟 submit_answer
    const userId = 1;
    const questionId = '2018-h30-chem-01';
    const subjectId = 'science';
    const selectedIndex = 1;
    const isCorrect = true;
    const isBookmarked = undefined;
    
    const safeIsBookmarked = isBookmarked === undefined ? null : isBookmarked;

    await connection.execute(
      `INSERT INTO user_answers (user_id, question_id, subject_id, selected_index, is_correct, is_bookmarked, wrong_count) 
       VALUES (?, ?, ?, ?, ?, ?, IF(? = false, 1, 0))
       ON DUPLICATE KEY UPDATE 
       selected_index = VALUES(selected_index),
       is_correct = VALUES(is_correct),
       is_bookmarked = IF(? IS NOT NULL, ?, is_bookmarked),
       wrong_count = wrong_count + IF(VALUES(is_correct) = false, 1, 0)`,
      [
        userId, 
        questionId, 
        subjectId || '', 
        selectedIndex ?? -1, 
        isCorrect ?? false, 
        safeIsBookmarked ?? false, 
        isCorrect ?? false,
        safeIsBookmarked, 
        safeIsBookmarked
      ]
    );
    console.log("user_answers insert OK");

    if (selectedIndex !== undefined && selectedIndex !== null) {
      await connection.execute(
        `INSERT INTO practice_logs (user_id, question_id, is_correct) VALUES (?, ?, ?)`,
        [userId, questionId, isCorrect ? 1 : 0]
      );
      console.log("practice_logs insert OK");
    }
  } catch(e) {
    console.error("Error during submit:", e);
  }
  await connection.end();
}
test();
