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

// 获取命令行参数
const inputPath = process.argv[2] || 'sample.json';
let jsonFilePath = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(jsonFilePath)) {
  jsonFilePath = path.join(__dirname, 'data', inputPath);
}

async function uploadQuestions() {
  console.log(`\n🚀 开始上传题目: ${jsonFilePath}`);

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ 错误: 找不到文件 ${jsonFilePath}`);
    process.exit(1);
  }

  let questions = [];
  try {
    questions = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    console.log(`✅ 成功读取 JSON，共找到 ${questions.length} 道题目。`);
  } catch (err) {
    console.error(`❌ 错误: JSON 解析失败! ${err.message}`);
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ 数据库连接成功!`);

    let successCount = 0;
    let failCount = 0;

    // 缓存 TopicCode -> ID 的映射，避免重复查询
    const topicCache = new Map();

    for (const q of questions) {
      try {
        // 1. 必填字段校验 (不再强制要求数字 ID，优先使用 Code)
        if (!(q.businessCode || q.business_code) || !q.stem || !q.options || (q.correctIndex === undefined && q.correct_index === undefined)) {
          throw new Error('缺少 businessCode/stem/options/correctIndex');
        }

        // 2. 解析 Topic ID (如果 JSON 传了 topicCode)
        let topicId = q.topicId || null;
        let sectionId = q.sectionId || null;
        let chapterId = q.chapterId || null;
        let subSubjectId = q.subSubjectId || null;
        let mainSubjectId = q.mainSubjectId || null;

        const tCode = q.topicCode || q.topicId; // 兼容逻辑

        if (tCode && typeof tCode === 'string') {
          if (topicCache.has(tCode)) {
            const cached = topicCache.get(tCode);
            topicId = cached.topicId;
            sectionId = cached.sectionId;
            chapterId = cached.chapterId;
            subSubjectId = cached.subSubjectId;
            mainSubjectId = cached.mainSubjectId;
          } else {
            // 通过 JOIN 向上溯源所有层级 ID
            const [rows] = await connection.execute(
              `SELECT t.id as t_id, s.id as s_id, c.id as c_id, sub.id as sub_id, sub.main_subject_id as main_id
               FROM topics t
               JOIN sections s ON t.section_id = s.id
               JOIN chapters c ON s.chapter_id = c.id
               JOIN sub_subjects sub ON c.sub_subject_id = sub.id
               WHERE t.code = ?`,
              [tCode]
            );

            if (rows.length > 0) {
              const r = rows[0];
              topicId = r.t_id;
              sectionId = r.s_id;
              chapterId = r.c_id;
              subSubjectId = r.sub_id;
              mainSubjectId = r.main_id;
              topicCache.set(tCode, { topicId, sectionId, chapterId, subSubjectId, mainSubjectId });
            } else {
              console.warn(`⚠️ 警告: 数据库中未找到 topicCode="${tCode}"，将尝试使用原始 ID 或设为 NULL`);
            }
          }
        }

        // 3. 执行插入
        const [result] = await connection.execute(
          `INSERT INTO questions (
             business_code, main_subject_id, sub_subject_id, chapter_id, section_id, topic_id,
             question_type, difficulty_level, score, stem, options, correct_index, explanation
           ) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             main_subject_id=VALUES(main_subject_id), 
             sub_subject_id=VALUES(sub_subject_id), 
             chapter_id=VALUES(chapter_id), 
             section_id=VALUES(section_id),
             topic_id=VALUES(topic_id),
             question_type=VALUES(question_type),
             difficulty_level=VALUES(difficulty_level), 
             score=VALUES(score),
             stem=VALUES(stem), 
             options=VALUES(options), 
             correct_index=VALUES(correct_index), 
             explanation=VALUES(explanation)`,
          [
            q.businessCode || q.business_code,
            mainSubjectId,
            subSubjectId,
            chapterId,
            sectionId,
            topicId,
            q.questionType || 1,
            q.difficultyLevel || 1,
            q.score || null,
            q.stem,
            JSON.stringify(q.options),
            q.correctIndex !== undefined ? q.correctIndex : q.correct_index,
            q.explanation || ''
          ]
        );

        const currentQuestionId = result.insertId || (await connection.execute('SELECT id FROM questions WHERE business_code=?', [q.businessCode || q.business_code]))[0][0].id;

        if (q.usageTypeId) {
          await connection.execute(
            `INSERT IGNORE INTO question_usage (question_id, usage_type_id) VALUES (?, ?)`,
            [currentQuestionId, q.usageTypeId]
          );
        }

        // 4. 处理 subtopicCodes 关联
        if (q.subtopicCodes && Array.isArray(q.subtopicCodes) && q.subtopicCodes.length > 0) {
          for (const stCode of q.subtopicCodes) {
            // 获取 subtopic_id
            const [stRows] = await connection.execute('SELECT id FROM subtopics WHERE code = ?', [stCode]);
            if (stRows.length > 0) {
              const subtopicId = stRows[0].id;
              // 批量写入 question_subtopics 关联表 (INSERT IGNORE 防重复)
              await connection.execute(
                `INSERT IGNORE INTO question_subtopics (question_id, subtopic_id) VALUES (?, ?)`,
                [currentQuestionId, subtopicId]
              );
            } else {
              console.warn(`  ⚠️ 警告: 未找到 subtopicCode="${stCode}"，关联跳过`);
            }
          }
        }

        console.log(`  ✔️ [成功] ${q.businessCode || q.business_code}`);
        successCount++;
      } catch (err) {
        console.error(`  ❌ [失败] ${q.businessCode || q.business_code || '未知'} - ${err.message}`);
        failCount++;
      }
    }

    console.log(`\n🎉 上传完成! 成功: ${successCount}, 失败: ${failCount}`);

  } catch (err) {
    console.error(`❌ 致命错误: ${err.message}`);
  } finally {
    if (connection) await connection.end();
  }
}

uploadQuestions();
