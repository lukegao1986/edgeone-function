const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 数据库连接配置 (请确保与云端一致)
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

// 获取命令行参数，默认读取 data/sample.json
const filename = process.argv[2] || 'sample.json';
const jsonFilePath = path.join(__dirname, 'data', filename);

async function uploadQuestions() {
  console.log(`\n🚀 开始解析题库文件: ${filename}`);

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ 错误: 找不到文件 ${jsonFilePath}`);
    console.log(`请确保文件存在于 scripts/uploader/data/ 目录下。`);
    process.exit(1);
  }

  // 1. 读取 JSON 文件
  let questions = [];
  try {
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    questions = JSON.parse(rawData);
    console.log(`✅ 成功读取 JSON，共找到 ${questions.length} 道题目。`);
  } catch (err) {
    console.error(`❌ 错误: JSON 解析失败! 请检查文件格式是否正确。`);
    console.error(err.message);
    process.exit(1);
  }

  // 2. 连接数据库
  console.log(`\n🔗 正在连接腾讯云数据库...`);
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ 数据库连接成功!`);
  } catch (err) {
    console.error(`❌ 错误: 数据库连接失败!`);
    console.error(err.message);
    process.exit(1);
  }

  // 3. 批量插入数据
  console.log(`\n📤 开始上传数据...`);
  let successCount = 0;
  let failCount = 0;

  for (const q of questions) {
    try {
      // 检查必填字段
      if (!q.id || !q.subjectId || !q.category || !q.stem || !q.options || q.correctIndex === undefined) {
        throw new Error(`缺少必填字段`);
      }

      // 执行插入 (如果 ID 冲突则忽略或更新)
      await connection.execute(
        `INSERT INTO questions (id, subject_id, category, stem, options, correct_index, explanation) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         subject_id=VALUES(subject_id), category=VALUES(category), stem=VALUES(stem), 
         options=VALUES(options), correct_index=VALUES(correct_index), explanation=VALUES(explanation)`,
        [
          q.id,
          q.subjectId,
          q.category,
          q.stem,
          JSON.stringify(q.options), // MySQL 中存 JSON 字符串
          q.correctIndex,
          q.explanation || ''
        ]
      );
      
      console.log(`  ✔️ [成功] 题号: ${q.id}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ [失败] 题号: ${q.id} - ${err.message}`);
      failCount++;
    }
  }

  // 4. 关闭连接
  await connection.end();
  
  console.log(`\n🎉 上传完成!`);
  console.log(`📊 统计: 成功上传 ${successCount} 题，失败 ${failCount} 题。\n`);
}

uploadQuestions();
