const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });
  
  const [res1] = await connection.execute('SELECT COUNT(*) as c FROM questions;');
  console.log("Total questions:", res1[0].c);
  
  const [res2] = await connection.execute('SELECT COUNT(DISTINCT question_id) as c FROM question_subtopics;');
  console.log("Tagged questions:", res2[0].c);

  await connection.end();
}
run();
