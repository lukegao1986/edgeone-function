const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequestGet(context) {
  // 从 URL 参数中获取 topicId, subjectId 和 userId
  const url = new URL(context.request.url);
  const topicId = url.searchParams.get('topicId'); // 对应 topics 表的 code，如 phy_1_1_1
  const subjectId = url.searchParams.get('subjectId'); // 对应 sub_subjects 表的 code，如 physics
  const userId = url.searchParams.get('userId');
  const difficulties = url.searchParams.get('difficulties'); // e.g. "1,2,3"

  if (!topicId && !subjectId) {
    return new Response(JSON.stringify({ success: false, error: "缺少查询参数 (topicId 或 subjectId)" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    let rows = [];
    let diffCondition = '';
    let diffParams = [];
    if (difficulties) {
      const diffArray = difficulties.split(',').map(d => parseInt(d, 10)).filter(d => !isNaN(d));
      if (diffArray.length > 0) {
        const placeholders = diffArray.map(() => '?').join(',');
        diffCondition = ` AND q.difficulty_level IN (${placeholders})`;
        diffParams = diffArray;
      }
    }

    if (topicId) {
      // 优先根据 topicId (topics.code) 进行关联查询
      [rows] = await connection.execute(
        `SELECT q.* 
         FROM questions q
         JOIN topics t ON q.topic_id = t.id
         WHERE t.code = ? AND q.is_enabled = 1 ${diffCondition}
         ORDER BY q.created_at ASC`,
        [topicId, ...diffParams]
      );
    } else if (subjectId) {
      // 兜底逻辑：根据二级学科 code 查询
      [rows] = await connection.execute(
        `SELECT q.* 
         FROM questions q
         JOIN sub_subjects sub ON q.sub_subject_id = sub.id
         WHERE sub.code = ? AND q.is_enabled = 1 ${diffCondition}
         ORDER BY q.created_at ASC`,
        [subjectId, ...diffParams]
      );
    }

    // 如果传了 userId，顺便把用户的答题记录带回去
    let userAnswers = {};
    if (userId && rows.length > 0) {
      const questionIds = rows.map(r => r.id);
      const placeholders = questionIds.map(() => '?').join(',');
      const [ansRows] = await connection.execute(
        `SELECT question_id, selected_index, is_correct, is_bookmarked 
         FROM user_answers 
         WHERE user_id = ? AND question_id IN (${placeholders})`,
        [userId, ...questionIds]
      );
      ansRows.forEach(row => {
        userAnswers[row.question_id] = {
          selectedIndex: row.selected_index,
          isCorrect: Boolean(row.is_correct),
          isBookmarked: Boolean(row.is_bookmarked)
        };
      });
    }

    await connection.end();

    // 格式化数据，对接前端新架构字段名
    const formattedQuestions = rows.map(row => ({
      id: row.id,
      businessCode: row.business_code,
      questionType: row.question_type,
      difficultyLevel: row.difficulty_level,
      score: row.score,
      stem: row.stem,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correctIndex: row.correct_index,
      explanation: row.explanation
    }));

    return new Response(JSON.stringify({
      success: true,
      data: formattedQuestions,
      userAnswers: userAnswers
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
