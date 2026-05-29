export default function onRequest(context) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>极简注册界面</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; margin: 0; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
    h2 { margin-top: 0; color: #333; text-align: center; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; color: #666; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 0.75rem; background-color: #0052d9; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
    button:hover { background-color: #003a99; }
    #message { margin-top: 1rem; text-align: center; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>账号注册</h2>
    <form id="registerForm">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" name="username" required placeholder="请输入用户名">
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" name="email" required placeholder="请输入邮箱">
      </div>
      <button type="submit">注册</button>
    </form>
    <div id="message"></div>
  </div>

  <script>
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById('message');
      msgEl.textContent = '提交中...';
      msgEl.style.color = '#666';
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if(result.success) {
          msgEl.textContent = '✅ 注册成功！(数据已通过边缘函数处理)';
          msgEl.style.color = 'green';
        } else {
          msgEl.textContent = '❌ 注册失败: ' + result.error;
          msgEl.style.color = 'red';
        }
      } catch (err) {
        msgEl.textContent = '❌ 请求出错，请稍后重试';
        msgEl.style.color = 'red';
      }
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
