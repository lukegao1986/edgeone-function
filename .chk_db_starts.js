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
  try {
    const [rows] = await connection.execute("SELECT business_code FROM questions WHERE business_code LIKE 'phy-01-q%'");
    const maxNums = { C: 0, E: 0, B: 0, A: 0 };
    
    rows.forEach(row => {
      const match = row.business_code.match(/^phy-01-q([CEBA])(\d+)$/);
      if (match) {
        const type = match[1];
        const num = parseInt(match[2], 10);
        if (num > maxNums[type]) {
          maxNums[type] = num;
        }
      }
    });
    
    console.log("=== Database Query Result ===");
    console.log(`C (基礎CHECK) start: ${maxNums.C + 1}`);
    console.log(`E (基本例題) start: ${maxNums.E + 1}`);
    console.log(`B (基本問題) start: ${maxNums.B + 1}`);
    console.log(`A (応用問題) start: ${maxNums.A + 1}`);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

main();
