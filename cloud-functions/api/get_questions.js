const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequestGet(context) {
  // 从 URL 参数中获取 subjectId 和 userId
  const url = new URL(context.request.url);
  const subjectId = url.searchParams.get('subjectId');
  const userId = url.searchParams.get('userId'); // 追加获取 userId

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

    // 如果传了 userId，顺便把用户在这个科目的答题记录和笔记也带回去
    let userAnswers = {};
    let userNotes = {};
    if (userId) {
      const [ansRows] = await connection.execute(
        'SELECT question_id, selected_index, is_correct, is_bookmarked FROM user_answers WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
      );
      ansRows.forEach(row => {
        userAnswers[row.question_id] = {
          selectedIndex: row.selected_index,
          isCorrect: Boolean(row.is_correct),
          isBookmarked: Boolean(row.is_bookmarked)
        };
      });

      const [noteRows] = await connection.execute(
        'SELECT question_id, content, updated_at FROM question_notes WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
      );
      noteRows.forEach(row => {
        userNotes[row.question_id] = {
          content: row.content,
          updatedAt: row.updated_at
        };
      });
    }

    await connection.end();

    // 格式化数据
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
      data: formattedQuestions,
      userAnswers: userAnswers,
      userNotes: userNotes
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
