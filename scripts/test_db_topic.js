const mysql = require('mysql2/promise');
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function test() {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute(`
    SELECT t.id as t_id, s.id as s_id, c.id as c_id, sub.id as sub_id, sub.main_subject_id as main_id, t.code
    FROM topics t
    JOIN sections s ON t.section_id = s.id
    JOIN chapters c ON s.chapter_id = c.id
    JOIN sub_subjects sub ON c.sub_subject_id = sub.id
    WHERE t.code LIKE 'phy_1_1_%'
  `);
  console.log(rows);
  await connection.end();
}
test();
