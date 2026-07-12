const mysql = require('mysql2/promise');
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};
async function main() {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute("SELECT business_code FROM questions WHERE business_code LIKE 'phy-03-q%'");
  const maxIndexes = { C: 0, E: 0, B: 0, A: 0 };
  rows.forEach(row => {
    const match = row.business_code.match(/q([CEBA])(\d+)$/);
    if (match) {
      const type = match[1];
      const num = parseInt(match[2], 10);
      if (num > maxIndexes[type]) maxIndexes[type] = num;
    }
  });
  console.log('MAX_INDEXES:', JSON.stringify(maxIndexes));
  await connection.end();
}
main();
