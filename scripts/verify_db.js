require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });

  const topicCodes = ['phy_1_1_2', 'phy_1_1_3', 'phy_1_1_5', 'phy_1_1_6'];

  for (const topicCode of topicCodes) {
    console.log(`\n=== Checking Topic: ${topicCode} ===`);
    
    // 1. Check count
    const [countRows] = await connection.execute(`
      SELECT COUNT(*) as count FROM questions WHERE topic_id = (
        SELECT id FROM topics WHERE code = ?
      ) AND business_code LIKE 'phy-04-%'
    `, [topicCode]);
    console.log(`题目数量: ${countRows[0].count}`);

    // 2. Check content
    const [contentRows] = await connection.execute(`
      SELECT business_code, LEFT(stem, 80) AS preview, 
             JSON_LENGTH(options) AS option_count, correct_index 
      FROM questions 
      WHERE topic_id = (SELECT id FROM topics WHERE code = ?)
        AND business_code LIKE 'phy-04-%'
      ORDER BY business_code
    `, [topicCode]);
    
    console.log(`\n题目内容预览:`);
    console.table(contentRows);

    // 3. Check subtopics
    const [subtopicRows] = await connection.execute(`
      SELECT q.business_code, st.code, st.name 
      FROM question_subtopics qs 
      JOIN questions q ON qs.question_id = q.id 
      JOIN subtopics st ON qs.subtopic_id = st.id 
      WHERE q.topic_id = (SELECT id FROM topics WHERE code = ?)
        AND q.business_code LIKE 'phy-04-%'
      ORDER BY q.business_code
    `, [topicCode]);

    console.log(`\n分考点关联情况:`);
    console.table(subtopicRows);
  }

  await connection.end();
}

main().catch(console.error);