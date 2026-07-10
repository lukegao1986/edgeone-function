const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // Check if the subtopic phy_1_1_3_01 exists in the database
    const [subtopics] = await connection.execute(
      `SELECT * FROM subtopics WHERE code = 'phy_1_1_3_01'`
    );
    console.log(`Subtopics found: ${subtopics.length}`);
    if (subtopics.length > 0) {
      console.log(`Subtopic ID: ${subtopics[0].id}`);
    } else {
      console.log('❌ Subtopic phy_1_1_3_01 NOT FOUND in database! Did syncSyllabus.js run correctly?');
      return;
    }

    // Check questions in phy_1_1_3
    const [questions] = await connection.execute(
      `SELECT q.id, q.business_code, q.topic_id, t.code as topic_code
       FROM questions q
       JOIN topics t ON q.topic_id = t.id
       WHERE t.code = 'phy_1_1_3'`
    );
    console.log(`Questions in phy_1_1_3: ${questions.length}`);
    
    // Check question_subtopics mapping
    const [mappings] = await connection.execute(
      `SELECT qs.*, q.business_code 
       FROM question_subtopics qs
       JOIN questions q ON qs.question_id = q.id
       JOIN topics t ON q.topic_id = t.id
       WHERE t.code = 'phy_1_1_3'`
    );
    console.log(`Mappings found for phy_1_1_3: ${mappings.length}`);
    
  } catch (err) {
    console.error('❌ 数据库检查出错:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

main();