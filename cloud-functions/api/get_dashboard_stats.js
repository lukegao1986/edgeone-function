const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

export default async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: "缺少 userId 参数" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. 获取累计刷题和累计正确 (从 user_answers 获取，代表已作答的独立题目数)
    const [totalRows] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(IF(is_correct = 1, 1, 0)) as correct FROM user_answers WHERE user_id = ? AND selected_index IS NOT NULL',
      [userId]
    );
    const totalAnswered = totalRows[0].total || 0;
    const totalCorrect = totalRows[0].correct || 0;

    // 2. 获取今日刷题
    const [todayRows] = await connection.execute(
      'SELECT COUNT(*) as todayTotal FROM practice_logs WHERE user_id = ? AND DATE(created_at) = CURDATE()',
      [userId]
    );
    const todayAnswered = todayRows[0].todayTotal || 0;

    // 3. 获取连续学习天数 (简易逻辑：查询用户有刷题记录的独立天数)
    const [streakRows] = await connection.execute(
      'SELECT COUNT(DISTINCT DATE(created_at)) as streakDays FROM practice_logs WHERE user_id = ?',
      [userId]
    );
    const streakDays = streakRows[0].streakDays || 0;

    // 4. 获取本周每天的正确率数据 (用于生成趋势图)
    const [trendRows] = await connection.execute(
      `SELECT 
         DATE(created_at) as date, 
         COUNT(*) as total, 
         SUM(IF(is_correct = 1, 1, 0)) as correct 
       FROM practice_logs 
       WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    // 5. 顺便拉取一下各个科目的题目总数，以便前端更新推荐卡片
    const [subjectCountRows] = await connection.execute(
      `SELECT subject_id, COUNT(*) as total FROM questions GROUP BY subject_id`
    );
    const subjectCounts = {};
    subjectCountRows.forEach(row => {
      subjectCounts[row.subject_id] = row.total;
    });

    await connection.end();

    // 补齐最近 7 天的数据
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const row = trendRows.find(r => {
        // Handle timezone issues if any, simple match
        const rDate = new Date(r.date);
        return rDate.toISOString().split('T')[0] === dateStr;
      });
      let rate = 0;
      if (row && row.total > 0) {
        rate = Math.round((row.correct / row.total) * 100);
      }
      trendData.push({ day: days[d.getDay()], rate });
    }

    // --- 生成 SVG 图表 ---
    const svgWidth = 800;
    const svgHeight = 250;
    const padding = 40;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;
    
    // Y 轴网格线 (0, 25, 50, 75, 100)
    let gridLines = '';
    let yLabels = '';
    [0, 25, 50, 75, 100].forEach(val => {
      const y = svgHeight - padding - (val / 100) * chartHeight;
      gridLines += `<line x1="${padding}" y1="${y}" x2="${svgWidth - padding}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />`;
      yLabels += `<text x="${padding - 10}" y="${y + 4}" font-size="12" fill="#9ca3af" text-anchor="end">${val}</text>`;
    });

    // 折线和数据点
    const points = trendData.map((d, i) => {
      const x = padding + (i / 6) * chartWidth;
      const y = svgHeight - padding - (d.rate / 100) * chartHeight;
      return { x, y, rate: d.rate, day: d.day };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // 渐变填充背景
    const fillPath = `${pathData} L ${points[6].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

    const svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fillGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#3B6EC9" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#3B6EC9" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        ${yLabels}
        <path d="${fillPath}" fill="url(#fillGradient)" />
        <path d="${pathData}" fill="none" stroke="#3B6EC9" stroke-width="3" />
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="#ffffff" stroke="#3B6EC9" stroke-width="2" />
          <text x="${p.x}" y="${svgHeight - padding + 20}" font-size="14" fill="#6b7280" text-anchor="middle">${p.day}</text>
        `).join('')}
      </svg>
    `;

    const trendSvgBase64 = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

    return new Response(JSON.stringify({
      success: true,
      data: {
        todayAnswered,
        totalAnswered,
        totalCorrect,
        streakDays,
        trendSvg: trendSvgBase64,
        subjectCounts: subjectCounts // 增加返回的科目题目数
      }
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "数据库错误: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}
