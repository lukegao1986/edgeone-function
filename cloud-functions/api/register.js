const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

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

    const connection = await mysql.createConnection(dbConfig);

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return new Response(JSON.stringify({ success: false, error: "用户名已存在，请直接登录" }), {
        status: 409,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );

    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      message: "注册成功",
      recordId: result.insertId
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
