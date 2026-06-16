const http = require('http');
const url = require('url');

// 加载你写好的云函数
const getQuestionsModule = require('./api/get_questions.js');
const getQuestions = getQuestionsModule.default || getQuestionsModule;

const submitAnswerModule = require('./api/submit_answer.js');
const submitAnswer = submitAnswerModule.default || submitAnswerModule;

const submitNoteModule = require('./api/submit_note.js');
const submitNote = submitNoteModule.default || submitNoteModule;

const getNotesListModule = require('./api/get_notes_list.js');
const getNotesList = getNotesListModule.default || getNotesListModule;

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
    } else if (reqUrl.pathname === '/api/get_notes_list') {
      const response = await getNotesList(context);
      const text = typeof response.text === 'function' ? await response.text() : JSON.stringify(response);
      res.writeHead(response.status || 200, { 'Content-Type': 'application/json' });
      res.end(text);
    } else if (reqUrl.pathname === '/api/submit_answer' || reqUrl.pathname === '/api/submit_note') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        context.request.json = async () => JSON.parse(body);
        try {
          const handler = reqUrl.pathname === '/api/submit_answer' ? submitAnswer : submitNote;
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