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

    // 1. 基础成就统计
    const [totalRows] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(IF(is_correct = 1, 1, 0)) as correct FROM practice_logs WHERE user_id = ?',
      [userId]
    );
    const totalAnswered = totalRows[0].total || 0;
    const totalCorrect = totalRows[0].correct || 0;
    const averageRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const [thisWeekRows] = await connection.execute(
      'SELECT COUNT(*) as thisWeek FROM practice_logs WHERE user_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)',
      [userId]
    );
    const thisWeekCount = thisWeekRows[0].thisWeek || 0;

    const [streakRows] = await connection.execute(
      'SELECT COUNT(DISTINCT DATE(created_at)) as streakDays FROM practice_logs WHERE user_id = ?',
      [userId]
    );
    const streakDays = streakRows[0].streakDays || 0;
    
    // 查询错题总数
    const [wrongRows] = await connection.execute(
      'SELECT COUNT(*) as wrongTotal FROM user_answers WHERE user_id = ? AND wrong_count > 0',
      [userId]
    );
    const wrongCount = wrongRows[0].wrongTotal || 0;

    // 2. 近 30 天刷题趋势
    const [trendRows] = await connection.execute(
      `SELECT 
         DATE(created_at) as date, 
         COUNT(*) as total 
       FROM practice_logs 
       WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    // 补齐最近 30 天数据
    const trendData = [];
    let maxDailyTotal = 1; // 用于计算 Y 轴最大值
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const row = trendRows.find(r => {
        const rDate = new Date(r.date);
        return rDate.toISOString().split('T')[0] === dateStr;
      });
      const total = row ? row.total : 0;
      if (total > maxDailyTotal) maxDailyTotal = total;
      trendData.push({ day: d.getDate() + '日', total });
    }

    // 3. 历史练习记录 (按天分组聚合)
    const [historyRows] = await connection.execute(
      `SELECT 
         DATE(pl.created_at) as date,
         ua.subject_id,
         COUNT(*) as total,
         SUM(IF(pl.is_correct = 1, 1, 0)) as correct
       FROM practice_logs pl
       LEFT JOIN user_answers ua ON pl.user_id = ua.user_id AND pl.question_id = ua.question_id
       WHERE pl.user_id = ?
       GROUP BY DATE(pl.created_at), ua.subject_id
       ORDER BY date DESC
       LIMIT 20`,
      [userId]
    );

    const formattedHistory = historyRows.map(row => {
      const rate = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
      const d = new Date(row.date);
      return {
        date: d.toISOString().split('T')[0],
        subjectId: row.subject_id || 'unknown',
        total: row.total,
        correct: row.correct,
        rate: rate + '%'
      };
    });

    await connection.end();

    // --- 生成 30 天 SVG 图表 ---
    const svgWidth = 1000;
    const svgHeight = 250;
    const paddingX = 40;
    const paddingY = 30;
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;
    
    // Y 轴动态网格 (分 4 段)
    let gridLines = '';
    let yLabels = '';
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.ceil((maxDailyTotal / ySteps) * i);
      const y = svgHeight - paddingY - (i / ySteps) * chartHeight;
      gridLines += `<line x1="${paddingX}" y1="${y}" x2="${svgWidth - paddingX}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />`;
      yLabels += `<text x="${paddingX - 10}" y="${y + 4}" font-size="12" fill="#9ca3af" text-anchor="end">${val}</text>`;
    }

    const points = trendData.map((d, i) => {
      const x = paddingX + (i / 29) * chartWidth;
      const y = svgHeight - paddingY - (d.total / maxDailyTotal) * chartHeight;
      return { x, y, total: d.total, day: d.day };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillPath = `${pathData} L ${points[29].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

    const svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fillGradient30" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#3B6EC9" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#3B6EC9" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        ${yLabels}
        <path d="${fillPath}" fill="url(#fillGradient30)" />
        <path d="${pathData}" fill="none" stroke="#3B6EC9" stroke-width="2" />
        ${points.map((p, i) => {
          // 只显示部分 X 轴文字，防止太密
          const showText = i % 2 === 0 ? `<text x="${p.x}" y="${svgHeight - paddingY + 20}" font-size="12" fill="#6b7280" text-anchor="middle">${p.day}</text>` : '';
          return `
          <circle cx="${p.x}" cy="${p.y}" r="3" fill="#ffffff" stroke="#3B6EC9" stroke-width="1.5" />
          ${showText}
        `}).join('')}
      </svg>
    `;

    const trendSvgBase64 = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

    return new Response(JSON.stringify({
      success: true,
      data: {
        stats: {
          streakDays,
          thisWeekCount,
          averageRate,
          totalAnswered,
          wrongCount
        },
        trendSvg: trendSvgBase64,
        history: formattedHistory
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
