const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
    port: 24547,
    user: 'root',
    password: '2199wlmm!',
    database: 'shuati_db'
  });
  
  const [totalRes] = await connection.execute('SELECT COUNT(*) as c FROM questions;');
  const total = totalRes[0].c;
  
  const [taggedRes] = await connection.execute('SELECT COUNT(DISTINCT question_id) as c FROM question_subtopics;');
  const tagged = taggedRes[0].c;
  
  console.log('Total questions:', total);
  console.log('Tagged questions:', tagged);
  console.log('Coverage:', ((tagged / total) * 100).toFixed(2) + '%');
  
  const sampleLimit = Math.ceil(total * 0.1);
  console.log('\n--- 10% Random Sample (' + sampleLimit + ' questions) ---');
  
  const [sampleRows] = await connection.execute(`
    SELECT q.id, q.stem, q.options, q.correct_index, GROUP_CONCAT(st.name) AS subtopic_names 
    FROM questions q 
    JOIN question_subtopics qs ON q.id = qs.question_id 
    JOIN subtopics st ON qs.subtopic_id = st.id 
    GROUP BY q.id 
    ORDER BY RAND() 
    LIMIT ${sampleLimit};
  `);
  
  sampleRows.forEach(row => {
    console.log('\nID:', row.id);
    console.log('Stem preview:', row.stem.substring(0, 50).replace(/\n/g, ' ') + '...');
    console.log('Subtopics:', row.subtopic_names);
  });
  
  console.log('\n--- Acceptance Point 6.2 ---');
  const [qsCount] = await connection.execute('SELECT COUNT(*) as c FROM question_subtopics;');
  console.log('Total records in question_subtopics:', qsCount[0].c);
  
  const [qsSample] = await connection.execute(`
    SELECT q.id AS question_id, LEFT(q.stem, 50) AS question_preview, st.code AS subtopic_code, st.name AS subtopic_name 
    FROM question_subtopics qs 
    JOIN questions q ON qs.question_id = q.id 
    JOIN subtopics st ON qs.subtopic_id = st.id 
    LIMIT 10;
  `);
  
  console.table(qsSample.map(r => ({
    question_id: r.question_id,
    question_preview: r.question_preview.replace(/\n/g, ' '),
    subtopic_code: r.subtopic_code,
    subtopic_name: r.subtopic_name
  })));

  await connection.end();
}
run();