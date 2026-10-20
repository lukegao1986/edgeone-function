const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });

  console.log('--- 题目数量 ---');
  const [countRes] = await connection.query(`
    SELECT COUNT(*) as cnt FROM questions WHERE business_code LIKE 'phy-01-q%';
  `);
  console.log('Total:', countRes[0].cnt);

  console.log('\n--- 题目内容预览 (前5条及最后5条) ---');
  const [previewRes] = await connection.query(`
    SELECT business_code, LEFT(stem, 50) AS preview, 
           JSON_LENGTH(options) AS option_count, correct_index 
    FROM questions 
    WHERE business_code LIKE 'phy-01-q%' 
    ORDER BY business_code;
  `);
  const displayPreview = [...previewRes.slice(0, 5), {business_code: '...'}, ...previewRes.slice(-5)];
  console.table(displayPreview);

  console.log('\n--- subtopicCodes 关联表检查 (部分展示) ---');
  const [subtopicRes] = await connection.query(`
    SELECT q.business_code, st.code, st.name 
    FROM question_subtopics qs 
    JOIN questions q ON qs.question_id = q.id 
    JOIN subtopics st ON qs.subtopic_id = st.id 
    WHERE q.business_code LIKE 'phy-01-q%' 
    ORDER BY q.business_code;
  `);
  const displaySubtopics = [...subtopicRes.slice(0, 5), {business_code: '...', code: '...', name: '...'}, ...subtopicRes.slice(-5)];
  console.table(displaySubtopics);
  console.log(`关联表总记录数: ${subtopicRes.length}`);

  await connection.end();
}

run().catch(console.error);