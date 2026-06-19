const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db',
  connectionLimit: 1,
  connectTimeout: 5000
};

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export default async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { username, password } = data;

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: "用户名和密码不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const connection = await getPool().getConnection();

    // Check if user exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    connection.release();

    if (rows.length > 0) {
      const user = rows[0];
      return new Response(JSON.stringify({
        success: true,
        message: "登录成功",
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          target_exam: user.target_exam
        }
      }), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: "用户名或密码错误"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
