const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

export default async function onRequest(context) {
  // EdgeOne 函数: 处理 CORS 预检请求 (OPTIONS)
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  let connection;
  try {
    const data = await context.request.json();
    const { username, password } = data;
    const inviteCode = (data.inviteCode || '').toString().trim().toUpperCase();

    if (!username || !password) {
      return json({ success: false, error: "用户名和密码不能为空" }, 400);
    }
    if (!inviteCode) {
      return json({ success: false, error: "请输入邀请码" }, 400);
    }
    if (!/^[A-Z0-9]{8}$/.test(inviteCode)) {
      return json({ success: false, error: "邀请码格式不正确" }, 400);
    }

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // 原子占用邀请码：status=0 → 1，affectedRows 判断，杜绝并发重复占用
    const [occupy] = await connection.execute(
      'UPDATE invite_codes SET status = 1, used_at = NOW() WHERE code = ? AND status = 0',
      [inviteCode]
    );
    if (occupy.affectedRows !== 1) {
      await connection.rollback();
      return json({ success: false, error: "邀请码无效或已被使用" }, 409);
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existingUsers.length > 0) {
      await connection.rollback();
      return json({ success: false, error: "用户名已存在，请直接登录" }, 409);
    }

    // Insert new user（记录来源邀请码）
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, invite_code, nickname) VALUES (?, ?, ?, ?)',
      [username, password, inviteCode, username]
    );

    // 回填邀请码使用者
    await connection.execute(
      'UPDATE invite_codes SET used_by = ? WHERE code = ?',
      [result.insertId, inviteCode]
    );

    await connection.commit();

    return json({
      success: true,
      message: "注册成功",
      recordId: result.insertId
    });

  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) { /* ignore */ }
    }
    return json({ success: false, error: "数据库错误: " + err.message }, 500);
  } finally {
    if (connection) await connection.end();
  }
}