const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function verify() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('=== 验证 Chapter 3 (phy-03-q%) ===');
  
  // 1. 检查题目总数
  const [countRes] = await connection.execute(`
    SELECT COUNT(*) as count FROM questions WHERE business_code LIKE 'phy-03-q%'
  `);
  console.log(`\n1. 导入题目总数: ${countRes[0].count} 道`);

  // 2. 检查各 topic 的题目数
  const [topicCountRes] = await connection.execute(`
    SELECT t.code, COUNT(*) as count 
    FROM questions q 
    JOIN topics t ON q.topic_id = t.id 
    WHERE q.business_code LIKE 'phy-03-q%'
    GROUP BY t.code
  `);
  console.log('\n2. 各考点题目数量分布:');
  console.table(topicCountRes);

  // 3. 检查题目内容
  const [contentRes] = await connection.execute(`
    SELECT business_code, LEFT(stem, 50) AS preview, 
           JSON_LENGTH(options) AS option_count, correct_index 
    FROM questions 
    WHERE business_code LIKE 'phy-03-q%'
    ORDER BY business_code
  `);
  console.log('\n3. 题目内容预览:');
  console.table(contentRes);

  // 4. 检查 subtopic 关联表
  const [subtopicRes] = await connection.execute(`
    SELECT q.business_code, st.code, st.name 
    FROM question_subtopics qs 
    JOIN questions q ON qs.question_id = q.id 
    JOIN subtopics st ON qs.subtopic_id = st.id 
    WHERE q.business_code LIKE 'phy-03-q%'
    ORDER BY q.business_code
  `);
  console.log(`\n4. 分考点 (Subtopics) 关联表写入数: ${subtopicRes.length} 条记录`);
  if (subtopicRes.length > 0) {
    console.table(subtopicRes);
  }

  await connection.end();
}

verify().catch(console.error);
