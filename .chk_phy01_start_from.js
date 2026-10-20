// ===== .chk_phy01_start_from.js =====
const mysql = require('mysql2/promise');
const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};
const CHAPTER = '01';
const PREFIX = `phy-${CHAPTER}-q`;
const PREFIX_LIKE = `phy-${CHAPTER}-q%`;

function maxPlusOne(rows, letter) {
  const re = new RegExp(`^${PREFIX.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')}${letter}(\\d+)$`);
  let max = 0;
  for (const r of rows) {
    const bc = r.business_code || r.businessCode;
    const m = re.exec(bc);
    if (m) { const n = parseInt(m[1],10); if (n>max) max = n; }
  }
  return max + 1;
}

(async () => {
  const conn = await mysql.createConnection(dbConfig);
  console.log(`✅ 连接成功 DB=${dbConfig.database}`);
  const [rows] = await conn.execute(
    "SELECT business_code FROM questions WHERE business_code LIKE ? ORDER BY business_code",
    [PREFIX_LIKE]
  );
  console.log(`当前 ${PREFIX_LIKE} 匹配到 ${rows.length} 条记录：`);
  for (const r of rows) console.log('  ·', r.business_code);
  const C = maxPlusOne(rows,'C');
  const E = maxPlusOne(rows,'E');
  const B = maxPlusOne(rows,'B');
  const A = maxPlusOne(rows,'A');
  console.log('\n========== 起号起点（max+1）==========');
  console.log(`  C (基礎CHECK, difficulty=1): ${C}   → 第一题 businessCode = phy-${CHAPTER}-qC${C}`);
  console.log(`  E (基本例題,  difficulty=2): ${E}   → 第一题 businessCode = phy-${CHAPTER}-qE${E}`);
  console.log(`  B (基本問題,  difficulty=2): ${B}   → 第一题 businessCode = phy-${CHAPTER}-qB${B}`);
  console.log(`  A (応用問題,  difficulty=3): ${A}   → 第一题 businessCode = phy-${CHAPTER}-qA${A}`);
  await conn.end();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
