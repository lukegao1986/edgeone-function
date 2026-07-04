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

// 考纲文件路径（改为 ejuSyllabus.ts）
const syllabusPath = path.resolve(__dirname, '../../src/data/ejuSyllabus.ts');

async function syncSyllabus() {
  console.log('🚀 开始从 ejuSyllabus.ts 同步考纲到数据库...');

  const content = fs.readFileSync(syllabusPath, 'utf8');

  // 正则匹配 EJU_SYLLABUS（原名 SCIENCE_SYLLABUS）
  // 注意：现在 EJU_SYLLABUS 是数组形式，所以用 \[ 匹配
  const match = content.match(/export const EJU_SYLLABUS: .* = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error('❌ 无法在 TS 文件中找到 EJU_SYLLABUS 数组');
    return;
  }

  let body = match[1];
  // 转换 TS 对象字面量为可解析的 JSON
  body = body.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
  body = body.replace(/'/g, '"');
  body = body.replace(/,(\s*[}\]])/g, '$1');

  let syllabus;
  try {
    syllabus = JSON.parse(body);
  } catch (err) {
    console.error('❌ JSON 解析失败，尝试 Function 构造器方案...');
    try {
      const cleanBody = match[1].replace(/export const EJU_SYLLABUS: .* = /, '');
      syllabus = new Function(`return ${cleanBody}`)();
    } catch (err2) {
      console.error('❌ 解析失败:', err2.message);
      return;
    }
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // ===== 第 1 层：遍历主科目 (main_subjects) =====
    for (const [mIdx, mainData] of syllabus.entries()) {
      console.log(`\n📚 同步主科目: ${mainData.name} (${mainData.code})`);

      // 写入 main_subjects 表（幂等）
      await connection.execute(
        `INSERT INTO main_subjects (code, name, sort_order)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order)`,
        [mainData.code, mainData.name, mainData.sort_order || mIdx + 1]
      );
      const [msRows] = await connection.execute(
        'SELECT id FROM main_subjects WHERE code = ?',
        [mainData.code]
      );
      const mainSubjectId = msRows[0].id;

      // ===== 第 2 层：遍历分科目 (sub_subjects) =====
      for (const [sIdx, subData] of (mainData.subSubjects || []).entries()) {
        console.log(`  📦 同步分科目: ${subData.name} (${subData.code})`);

        // 写入 sub_subjects 表（幂等）
        await connection.execute(
          `INSERT INTO sub_subjects (main_subject_id, code, name, sort_order)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             main_subject_id = VALUES(main_subject_id),
             name = VALUES(name),
             sort_order = VALUES(sort_order)`,
          [mainSubjectId, subData.code, subData.name, subData.sort_order || sIdx + 1]
        );
        const [ssRows] = await connection.execute(
          'SELECT id FROM sub_subjects WHERE code = ?',
          [subData.code]
        );
        const subSubjectId = ssRows[0].id;

        // ===== 第 3 层：遍历章 (chapters) =====
        for (const [cIdx, chapter] of (subData.chapters || []).entries()) {
          await connection.execute(
            `INSERT INTO chapters (sub_subject_id, code, title, sort_order)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               title = VALUES(title),
               sort_order = VALUES(sort_order)`,
            [subSubjectId, chapter.id, chapter.title, cIdx + 1]
          );
          const [cRows] = await connection.execute(
            'SELECT id FROM chapters WHERE code = ?',
            [chapter.id]
          );
          const chapterId = cRows[0].id;

          // ===== 第 4 层：遍历节 (sections) =====
          for (const [sIdx, section] of (chapter.sections || []).entries()) {
            await connection.execute(
              `INSERT INTO sections (chapter_id, code, title, sort_order)
               VALUES (?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
                 title = VALUES(title),
                 sort_order = VALUES(sort_order)`,
              [chapterId, section.id, section.title, sIdx + 1]
            );
            const [sRows] = await connection.execute(
              'SELECT id FROM sections WHERE code = ?',
              [section.id]
            );
            const sectionId = sRows[0].id;

            // ===== 第 5 层：遍历考点 (topics) =====
            // 注意：原 section.subTopics 改为 section.topics
            for (const [tIdx, topic] of (section.topics || []).entries()) {
              await connection.execute(
                `INSERT INTO topics (section_id, code, title, sort_order)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   title = VALUES(title),
                   sort_order = VALUES(sort_order)`,
                [sectionId, topic.id, topic.title, tIdx + 1]
              );
              const [tRows] = await connection.execute(
                'SELECT id FROM topics WHERE code = ?',
                [topic.id]
              );
              const topicId = tRows[0].id;

              // ===== 第 6 层（新增）：遍历分考点 (subtopics) =====
              if (topic.subtopics && topic.subtopics.length > 0) {
                for (const [stIdx, subtopic] of topic.subtopics.entries()) {
                  await connection.execute(
                    `INSERT INTO subtopics (topic_id, code, name, aliases, description, sort_order)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                       name = VALUES(name),
                       aliases = VALUES(aliases),
                       description = VALUES(description),
                       sort_order = VALUES(sort_order)`,
                    [
                      topicId,
                      subtopic.code,
                      subtopic.name,
                      JSON.stringify(subtopic.aliases || []),
                      subtopic.description || null,
                      stIdx + 1
                    ]
                  );
                }
              }
            }
          }
        }
        console.log(`  ✅ ${subData.name} 同步完成`);
      }
      console.log(`✅ ${mainData.name} 同步完成`);
    }

    console.log('\n🎉 全部考纲同步完成');
  } catch (err) {
    console.error('❌ 数据库同步出错:', err.message);
    console.error(err.stack);
  } finally {
    if (connection) await connection.end();
  }
}

syncSyllabus();
