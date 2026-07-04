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
  const url = new URL(context.request.url);
  const topicId = url.searchParams.get('topic_id') || url.searchParams.get('topicId');
  const chapterId = url.searchParams.get('chapter_id') || url.searchParams.get('chapterId');

  if (!topicId && !chapterId) {
    return new Response(JSON.stringify({ success: false, error: "缺少查询参数 (topic_id 或 chapter_id)" }), {
      status: 400,
      headers: { 
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
        }
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    let sql = `
      SELECT st.id AS subtopic_id,
             st.code AS subtopic_code,
             st.name AS subtopic_name,
             t.id AS topic_id,
             t.code AS topic_code,
             t.title AS topic_name,
             COUNT(qs.question_id) AS frequency
      FROM subtopics st
      JOIN topics t ON st.topic_id = t.id
      JOIN question_subtopics qs ON st.id = qs.subtopic_id
    `;
    
    const params = [];
    const conditions = [];

    if (topicId) {
      // 兼容传 code 或 id 的情况
      if (isNaN(parseInt(topicId))) {
        conditions.push('t.code = ?');
      } else {
        conditions.push('st.topic_id = ?');
      }
      params.push(topicId);
    }
    
    if (chapterId) {
      sql += ' JOIN sections s ON t.section_id = s.id';
      if (isNaN(parseInt(chapterId))) {
        conditions.push('s.chapter_id = (SELECT id FROM chapters WHERE code = ?)');
      } else {
        conditions.push('s.chapter_id = ?');
      }
      params.push(chapterId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += `
      GROUP BY st.id, st.code, st.name, t.id, t.code, t.title
      ORDER BY frequency DESC
    `;

    const [rows] = await connection.execute(sql, params);
    
    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      subtopics: rows
    }), {
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
