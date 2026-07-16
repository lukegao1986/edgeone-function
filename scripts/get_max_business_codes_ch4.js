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
    const [rows] = await connection.execute("SELECT business_code FROM questions WHERE business_code LIKE 'phy-04-q%'");
    
    let maxC = 0, maxE = 0, maxB = 0, maxA = 0;
    
    for (const row of rows) {
      const code = row.business_code;
      const match = code.match(/^phy-04-q([CEBA])(\d+)$/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2], 10);
        if (type === 'C' && num > maxC) maxC = num;
        if (type === 'E' && num > maxE) maxE = num;
        if (type === 'B' && num > maxB) maxB = num;
        if (type === 'A' && num > maxA) maxA = num;
      }
    }
    
    console.log(`Max C: ${maxC}`);
    console.log(`Max E: ${maxE}`);
    console.log(`Max B: ${maxB}`);
    console.log(`Max A: ${maxA}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.end();
  }
}

getMaxCodes();