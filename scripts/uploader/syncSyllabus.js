const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

// 考纲文件路径
const syllabusPath = path.resolve(__dirname, '../../src/data/scienceSyllabus.ts');

async function syncSyllabus() {
  console.log('🚀 开始从前端代码同步考纲到数据库...');

  const content = fs.readFileSync(syllabusPath, 'utf8');
  
  // 使用更激进的正则转换，将 TS 对象字面量转为可解析的 JSON
  const match = content.match(/export const SCIENCE_SYLLABUS: .* = ({[\s\S]*?});/);
  if (!match) {
    console.error('❌ 无法在 TS 文件中找到 SCIENCE_SYLLABUS 对象');
    return;
  }

  let body = match[1];
  // 1. 处理属性名 (把 physics: 改为 "physics":)
  body = body.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
  // 2. 处理字符串 (把 '内容' 改为 "内容")
  body = body.replace(/'/g, '"');
  // 3. 移除多余的逗号
  body = body.replace(/,(\s*[}\]])/g, '$1');
  // 4. 处理一些可能的特殊字符（比如日文中的引号等，这里暂不处理）

  let syllabus;
  try {
    syllabus = JSON.parse(body);
  } catch (err) {
    console.error('❌ 解析失败，尝试第二种方案...');
    try {
      // 方案二：利用 Function 构造器执行代码（在受控环境下是安全的）
      const cleanBody = match[1].replace(/export const SCIENCE_SYLLABUS: .* = /, '');
      syllabus = new Function(`return ${cleanBody}`)();
    } catch (err2) {
      console.error('❌ 方案二也失败了:', err2.message);
      return;
    }
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    for (const [subjectKey, subjectData] of Object.entries(syllabus)) {
      console.log(`\n📦 同步科目: ${subjectData.name} (${subjectKey})`);

      const [subs] = await connection.execute('SELECT id FROM sub_subjects WHERE code = ?', [subjectKey]);
      if (subs.length === 0) continue;
      const subSubjectId = subs[0].id;

      for (const [cIdx, chapter] of subjectData.chapters.entries()) {
        await connection.execute(
          `INSERT INTO chapters (sub_subject_id, code, title, sort_order) 
           VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), sort_order=VALUES(sort_order)`,
          [subSubjectId, chapter.id, chapter.title, cIdx + 1]
        );
        const [cRows] = await connection.execute('SELECT id FROM chapters WHERE code = ?', [chapter.id]);
        const chapterId = cRows[0].id;

        for (const [sIdx, section] of chapter.sections.entries()) {
          await connection.execute(
            `INSERT INTO sections (chapter_id, code, title, sort_order) 
             VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), sort_order=VALUES(sort_order)`,
            [chapterId, section.id, section.title, sIdx + 1]
          );
          const [sRows] = await connection.execute('SELECT id FROM sections WHERE code = ?', [section.id]);
          const sectionId = sRows[0].id;

          for (const [tIdx, topic] of section.subTopics.entries()) {
            await connection.execute(
              `INSERT INTO topics (section_id, code, title, sort_order) 
               VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), sort_order=VALUES(sort_order)`,
              [sectionId, topic.id, topic.title, tIdx + 1]
            );
          }
        }
      }
      console.log(`✅ ${subjectData.name} 同步完成`);
    }
  } catch (err) {
    console.error('❌ 数据库同步出错:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

syncSyllabus();
