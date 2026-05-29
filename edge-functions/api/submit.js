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

    // 这里演示了如何与腾讯数据（例如 EdgeOne KV 存储 或 uniCloud API）交互。
    // 如果你绑定了 EdgeOne 的 KV 存储，可通过 context.env.YOUR_KV_NAMESPACE 来操作
    // 示例： await context.env.MY_DB.put(username, JSON.stringify({ email, time: Date.now() }));
    
    // 如果你想直接向 uniCloud / 云开发发请求，可以通过 fetch:
    // await fetch('你的uniCloud云函数URL', { method: 'POST', body: JSON.stringify(data) });

    return new Response(JSON.stringify({
      success: true,
      message: "数据录入成功",
      record: {
        username,
        email,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "服务器内部错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
