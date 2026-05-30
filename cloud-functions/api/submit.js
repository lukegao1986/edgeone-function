const mysql = require('mysql2/promise');

export default async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { username, email } = data;

    if (!username || !email) {
      return new Response(JSON.stringify({ success: false, error: "用户名和邮箱不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // 1. 建立与腾讯云轻量数据库的连接
    // 注意：边缘计算是公网环境，你的数据库必须在控制台开启“公网访问”或“外网地址”
    const connection = await mysql.createConnection({
      host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',      // 例如：1.2.3.4 或 xxx.mysql.tencentcloud.com
      port: 24547,                         // 默认 3306，若有外网端口请修改
      user: 'root',             // 例如：root
      password: '2199wlmm!',           // 你的密码
      database: 'shuati_db'               // 从你的截图看到库名是 shuati_db
    });

    // 2. 写入数据到 users 表
    const [result] = await connection.execute(
      'INSERT INTO users (username, email) VALUES (?, ?)',
      [username, email]
    );

    // 3. 关闭连接
    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      message: "已成功写入腾讯云 MySQL 数据库",
      recordId: result.insertId
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    // 捕获连接失败或SQL执行失败的异常
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
