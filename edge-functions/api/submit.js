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

    // 这里填入你在 uniCloud Web 控制台开启“URL化”后得到的地址
    const UNICLOUD_URL = "https://替换为你的uniCloud云函数URL化地址";

    if (UNICLOUD_URL.includes("替换为你的")) {
      return new Response(JSON.stringify({
        success: true,
        message: "数据录入成功 (由于未配置真实的 uniCloud URL，此为模拟成功)",
        record: { username, email, timestamp: new Date().toISOString() }
      }), { headers: { "Content-Type": "application/json; charset=utf-8" } });
    }

    // 真实发起请求到你的 uniCloud
    const uniRes = await fetch(UNICLOUD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });

    const uniData = await uniRes.json();

    return new Response(JSON.stringify({
      success: true,
      message: "已成功推送到 uniCloud",
      uniCloudResponse: uniData
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "服务器内部错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
