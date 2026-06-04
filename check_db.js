const mysql = require('mysql2/promise');
async function check() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });
  
  try {
    // 1. Check if practice_logs exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS practice_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        question_id VARCHAR(50) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_date (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("practice_logs table checked/created.");

    // 2. Query some data
    const [logs] = await connection.execute('SELECT * FROM practice_logs LIMIT 5');
    console.log("Logs:", logs);
    
    const [ans] = await connection.execute('SELECT * FROM user_answers LIMIT 5');
    console.log("User Answers:", ans);

  } catch(e) {
    console.error(e);
  }
  await connection.end();
}
check();
