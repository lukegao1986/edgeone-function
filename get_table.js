const mysql = require('mysql2/promise');
async function check() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });
  const [desc] = await connection.execute('DESCRIBE questions');
  console.log(desc);
  await connection.end();
}
check();
