const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 因为我们将云函数文件都改为了 ES Module (export default)
// 而 local_server.js 运行在 CommonJS 模式下，直接 require 会报错
// 解决办法：在本地开发时，我们动态将 ES Module 转换为 CommonJS 来执行

function loadModule(filePath) {
  const content = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
  // 简单的正则替换，把 export default async function onRequest(context)
  // 替换成 module.exports = async function onRequest(context)
  const cjsContent = content.replace(/export default async function onRequest\w*\(context\) \{/, 'module.exports = async function onRequest(context) {');
  
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(cjsContent, filePath);
  return m.exports;
}

// 加载你写好的云函数
let getQuestions;
try {
  getQuestions = loadModule('./api/get_questions.js');
} catch (e) {
  console.log('未找到 get_questions.js', e.message);
}

let getSubtopicFrequency;
try {
  getSubtopicFrequency = loadModule('./api/get_subtopic_frequency.js');
} catch (e) {
  console.log('未找到 get_subtopic_frequency.js，已忽略');
}

let submitAnswer;
try {
  submitAnswer = loadModule('./api/submit_answer.js');
} catch (e) {
  console.log('未找到 submit_answer.js，已忽略');
}

let submitNote;
try {
  submitNote = loadModule('./api/submit_note.js');
} catch (e) {
  console.log('未找到 submit_note.js，已忽略');
}

let getNotesList;
try {
  getNotesList = loadModule('./api/get_notes_list.js');
} catch (e) {
  console.log('未找到 get_notes_list.js，已忽略');
}

let login;
try {
  login = loadModule('./api/login.js');
} catch(e) {
  console.log('未找到 login.js, 已忽略');
}

let register;
try {
  register = loadModule('./api/register.js');
} catch(e) {
  console.log('未找到 register.js, 已忽略');
}

let getDashboardStats;
try {
  getDashboardStats = loadModule('./api/get_dashboard_stats.js');
} catch(e) {
  console.log('未找到 get_dashboard_stats.js, 已忽略');
}

let getProfileStats;
try {
  getProfileStats = loadModule('./api/get_profile_stats.js');
} catch(e) {
  console.log('未找到 get_profile_stats.js, 已忽略');
}

let getErrorbook;
try {
  getErrorbook = loadModule('./api/get_errorbook.js');
} catch(e) {
  console.log('未找到 get_errorbook.js, 已忽略');
}

let removeError;
try {
  removeError = loadModule('./api/remove_error.js');
} catch(e) {
  console.log('未找到 remove_error.js, 已忽略');
}

const server = http.createServer(async (req, res) => {
  // 设置最基本的 CORS 允许本地联调
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const reqUrl = url.parse(req.url, true);
  
  // 模拟 EdgeOne 的请求上下文
  const context = {
    request: {
      url: `http://127.0.0.1:8080${req.url}`
    }
  };

  try {
    if (reqUrl.pathname === '/api/get_questions') {
      const response = await getQuestions(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/get_subtopic_frequency' && getSubtopicFrequency) {
      const response = await getSubtopicFrequency(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/get_notes_list' && getNotesList) {
      const response = await getNotesList(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/get_dashboard_stats' && getDashboardStats) {
      const response = await getDashboardStats(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/get_profile_stats' && getProfileStats) {
      const response = await getProfileStats(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/get_errorbook' && getErrorbook) {
      const response = await getErrorbook(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/submit_answer' || reqUrl.pathname === '/api/submit_note' || reqUrl.pathname === '/api/login' || reqUrl.pathname === '/api/register' || reqUrl.pathname === '/api/remove_error') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        context.request.json = async () => JSON.parse(body);
        try {
          let handler;
          if (reqUrl.pathname === '/api/submit_answer') handler = submitAnswer;
          else if (reqUrl.pathname === '/api/submit_note') handler = submitNote;
          else if (reqUrl.pathname === '/api/login') handler = login;
          else if (reqUrl.pathname === '/api/register') handler = register;
          else if (reqUrl.pathname === '/api/remove_error') handler = removeError;
          
          if (!handler) {
            res.writeHead(404);
            res.end('Handler Not Found');
            return;
          }

          const response = await handler(context);
          const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
          res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
          res.end(text);
        } catch (e) {
          console.error(e);
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      });
      return;
    } else {
      res.writeHead(404);
      res.end('Not Found in Local Server');
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(8080, () => {
  console.log('✅ 本地云函数模拟器已启动: http://127.0.0.1:8080');
});