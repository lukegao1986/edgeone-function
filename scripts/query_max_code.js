const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function getMaxCodes() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const prefixes = ['phy-05-qC', 'phy-05-qE', 'phy-05-qB', 'phy-05-qA'];
    const results = {};

    for (const prefix of prefixes) {
      const [rows] = await connection.execute(
        `SELECT business_code FROM questions WHERE business_code LIKE ? ORDER BY LENGTH(business_code) DESC, business_code DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      if (rows.length > 0) {
        const maxCode = rows[0].business_code;
        const maxNum = parseInt(maxCode.replace(prefix, ''), 10);
        results[prefix] = isNaN(maxNum) ? 0 : maxNum;
      } else {
        results[prefix] = 0;
      }
    }
    
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    if (connection) await connection.end();
  }
}

getMaxCodes();
