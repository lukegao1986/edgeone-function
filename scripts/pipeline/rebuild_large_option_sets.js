const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const CHAPTERS = [21, 22, 23, 24, 25, 26, 27, 28, 29];
const MAX_OPTIONS = 16;
const CONCURRENCY = 4;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeLatex(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text.replace(/\\\\/g, '\\');
  out = out.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  out = out.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  return out.replace(/\s+/g, ' ').trim();
}

function uniqueStrings(items) {
  const result = [];
  const seen = new Set();
  for (const item of items) {
    const normalized = normalizeLatex(String(item || ''));
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function extractQuestionTasks() {
  const tasks = [];
  for (const ch of CHAPTERS) {
    const prefix = ch >= 28 ? 'phy_5' : 'phy_4';
    const jsonPath = path.join(
      process.cwd(),
      `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`
    );
    if (!fs.existsSync(jsonPath)) continue;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    data.forEach((q, index) => {
      const optionCount = Array.isArray(q.options) ? q.options.length : 0;
      if (optionCount > 7) {
        tasks.push({
          chapter: ch,
          jsonPath,
          index,
          businessCode: q.businessCode,
        });
      }
    });
  }
  return tasks;
}

async function regenerateOptions(question) {
  const originalCount = Array.isArray(question.options) ? question.options.length : 0;
  const targetCount = Math.min(originalCount, MAX_OPTIONS);
  const correctOption = normalizeLatex(question.options[question.correctIndex]);
  if (!correctOption) {
    throw new Error(`Missing correct option for ${question.businessCode}`);
  }

  const prompt = [
    '你是一个 EJU 物理题库编辑专家。',
    '请根据题干、正确答案和解析，为该题生成一组新的选项。',
    `总选项数必须为 ${targetCount} 个，其中包含且只包含 1 个正确答案和 ${targetCount - 1} 个错误选项。`,
    '必须满足以下硬约束：',
    '1. 所有选项都要互不重复。',
    '2. 选项之间要有足够区分度，不能只是改动一个很小的小问数值就形成一长串近乎相同的选项。',
    '3. 如果该题是多空/多问组合答案，请让错误选项在多个位置上形成不同错误模式；不要把所有干扰项都只改同一个位置。',
    '4. 保留原始语言风格，公式统一用 $...$ 或 $$...$$。',
    '5. 正确答案必须与给定正确答案等价，优先保持原表达。',
    '6. 若原选项数超过 16，必须熔断到 16 个。',
    '',
    `businessCode: ${question.businessCode}`,
    `题干: ${question.stem}`,
    `正确答案: ${correctOption}`,
    `解析: ${question.explanation || ''}`,
    '',
    '请只返回 JSON：',
    '{',
    '  "correctOption": "正确答案文本",',
    '  "distractors": ["错误选项1", "错误选项2", "..."]',
    '}',
  ].join('\n');

  let finalCorrect = correctOption;
  let distractors = [];
  for (let attempt = 0; attempt < 3 && distractors.length < targetCount - 1; attempt += 1) {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      temperature: 0.4 + attempt * 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Output ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    finalCorrect = normalizeLatex(parsed.correctOption || finalCorrect);
    distractors = uniqueStrings([...(distractors || []), ...((parsed.distractors || []).map(String))]).filter(
      item => item !== finalCorrect
    );
  }

  // Keep original wrong options as a fallback pool so the batch can finish.
  const originalWrongOptions = uniqueStrings(
    question.options.filter((item, idx) => idx !== question.correctIndex)
  ).filter(item => item !== finalCorrect);
  distractors = uniqueStrings([...distractors, ...originalWrongOptions]).filter(item => item !== finalCorrect);
  const needed = targetCount - 1;
  if (distractors.length < needed) {
    throw new Error(`Insufficient distractors for ${question.businessCode}: ${distractors.length}/${needed}`);
  }

  const options = uniqueStrings([finalCorrect, ...distractors.slice(0, needed)]);
  if (options.length !== targetCount) {
    throw new Error(`Unexpected option count for ${question.businessCode}: ${options.length}/${targetCount}`);
  }

  const shuffled = shuffleArray(options);
  const correctIndex = shuffled.indexOf(finalCorrect);
  if (correctIndex < 0) {
    throw new Error(`Correct option lost for ${question.businessCode}`);
  }

  return {
    options: shuffled,
    correctIndex,
  };
}

async function runPool(items, worker, limit) {
  const queue = [...items];
  const workers = new Array(Math.min(limit, queue.length)).fill(null).map(async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const tasks = extractQuestionTasks();
  const cache = new Map();

  for (const task of tasks) {
    if (!cache.has(task.jsonPath)) {
      cache.set(task.jsonPath, JSON.parse(fs.readFileSync(task.jsonPath, 'utf8')));
    }
  }

  await runPool(
    tasks,
    async (task) => {
      const data = cache.get(task.jsonPath);
      const question = data[task.index];
      process.stdout.write(`Rebuilding ${question.businessCode} (${question.options.length} options)\n`);
      const rebuilt = await regenerateOptions(question);
      question.options = rebuilt.options;
      question.correctIndex = rebuilt.correctIndex;
    },
    CONCURRENCY
  );

  for (const [jsonPath, data] of cache.entries()) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    process.stdout.write(`Saved ${jsonPath}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
