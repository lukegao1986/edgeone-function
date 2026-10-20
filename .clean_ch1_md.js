const fs = require('fs');
const path = require('path');

const IN_DIR = 'docs/0 数据准备/Charpter 1-30/charpter1';
const FILES = ['charpter1题目.md', 'charpter1解析.md'];

const changes = {
  空行压缩: 0,
  标题层级转换: [],
  LaTeX规范化: 0,
  图片标签修正: 0,
  页眉页脚水印删除: [],
  外部视频提示删除: [],
  数字引用删除: [],
  装饰图删除: [],
  OCR误识别修正: [],
};

let imgRemoved = 0, imgKept = 0;
function log(cat, detail) {
  if (typeof changes[cat] === 'number') changes[cat]++;
  else changes[cat].push(String(detail).slice(0, 200));
}

function normalizeLatexInner(s) {
  let before = s;
  s = s.replace(/(\d)\s+(?=\d|\\cdot|\\mathrm|\^|_\{|,|\})/g, '$1');
  s = s.replace(/(\d)\s+\.\s+(\d)/g, '$1.$2');
  s = s.replace(/(\\frac)\s*\{/g, '$1{');
  s = s.replace(/(\\text)\s*\{/g, '$1{');
  s = s.replace(/(\\mathrm)\s*\{/g, '$1{');
  s = s.replace(/\^\s*\{/g, '^{');
  s = s.replace(/_\s*\{/g, '_{');
  s = s.replace(/^(\s*\\(begin|end)\{[a-zA-Z*]+\})\s+/gm, '$1');
  if (s !== before) changes.LaTeX规范化++;
  return s;
}

function clean(src, isAns) {
  const images = [];
  src = src.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => {
    const i = images.length;
    images.push({ alt, url });
    return `\u0000IMG${i}\u0000`;
  });

  src = src.replace(/(?:^|\n)[ \t]*(?:→|⇒|➡|→)[^\n→]*(?:解説|解说|動画|视频|动画|QR|バーコード|二维码|qr)[^\n]*/gi, (m) => {
    log('外部视频提示删除', m.trim().replace(/\n/g, '\\n'));
    return '\n';
  });

  src = src.replace(/[。.．、]?[ \t]*(?:→|⇒)[ \t]*(?:例題|例题)?[ \t]*\d{1,2}[\d,，、\s]*$/gm, (m) => {
    const t = m.trim();
    if (t.length > 0 && /\d/.test(t)) {
      const pre = /^[。.．、]/.test(m) ? m[0] : '';
      log('数字引用删除', t);
      return pre;
    }
    return m;
  });
  src = src.replace(/(?:^|\n)[ \t]*\[?\s*\d{2}\s*[^\]\n]*\]?\s*(?:→|⇒)[ \t]*(?:例題|例题)?[ \t]*\d[\d,，、\s]*(?:\n|$)/g, (m) => {
    const t = m.trim();
    if (/→|⇒/.test(t) && /\d,\s*\d/.test(t)) {
      log('数字引用删除', t);
      return '\n';
    }
    return m;
  });

  src = src.replace(/(?:^|\n)[ \t]*→[ \t]*\d[\d,，、\s]*(?:\n|$)/g, (m) => {
    log('数字引用删除', m.trim());
    return '\n';
  });

  const lines = src.split(/\r?\n/);
  const filtered = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (/^\d{1,3}$/.test(t)) {
      const next = lines[i + 1] ? lines[i + 1].trim() : '';
      const prev = lines[i - 1] ? lines[i - 1].trim() : '';
      if (!/^\s*\(\s*\d+\s*\)/.test(next) && !/■|▪|☐|□|◆|✿/.test(prev) && (t === '10' || t === '13' || t === '14' || t === '19' || t.length <= 2)) {
        log('页眉页脚水印删除', `独立行纯数字「${t}」`);
        continue;
      }
    }
    if (/^(?:图|図)\s*[a-zA-Zａ-ｚＡ-Ｚ0-9０-９一二三四五六七八九十]+$/.test(t)) {
      log('页眉页脚水印删除', `图注标号独立行「${t}」`);
      continue;
    }
    if (/^[a-zA-Z]$/.test(t) && /^(图|図)/.test(lines[i-2] ? lines[i-2].trim() : '')) {
      log('页眉页脚水印删除', `孤立字母标号「${t}」`);
      continue;
    }
    filtered.push(raw);
  }
  src = filtered.join('\n');

  src = src.replace(/ここが\s*パイシ/g, (m) => {
    log('OCR误识别修正', m + ' → ここがポイント');
    return 'ここがポイント';
  });

  src = src.replace(/(\d+(?:\.\d+)?)\s+\$\^(\{[^}]*\}|[^{}])\$/g, (m, num, exp) => {
    changes.LaTeX规范化++;
    return `$${num}^{${exp.replace(/[{}]/g, '')}}$`;
  });
  src = src.replace(/(\d+(?:\.\d+)?)\s+\$_(\{[^}]*\}|[^{}])\$/g, (m, num, sub) => {
    changes.LaTeX规范化++;
    return `$${num}_{${sub.replace(/[{}]/g, '')}}$`;
  });

  src = src.replace(/\$\s*([\s\S]*?)\s*\$/g, (m, inner) => {
    const s = normalizeLatexInner(inner);
    return `$${s}$`;
  });
  src = src.replace(/\$\$([\s\S]*?)\$\$/g, (m, inner) => {
    const s = normalizeLatexInner(inner).trim();
    return `$$${s}$$`;
  });

  src = src.replace(/\u0000IMG(\d+)\u0000/g, (m, iStr) => {
    const idx = +iStr;
    const obj = images[idx];
    const url = (obj.url || '').trim();
    const lowUrl = url.toLowerCase();
    const decoRe = /(icon|deco|banner|mark|seal|stamp|point[_\-]|解答|answer|header|footer|qrcode|qr[_\-]|barcode|qrコード|logo|character|mascot|illust|chara|cartoon|キャラクター|decoration|decorative|person|girl|boy|human|figure[_\-])/i;
    if (isAns && decoRe.test(lowUrl)) {
      imgRemoved++;
      log('装饰图删除', url);
      return '';
    }
    imgKept++;
    const fixedUrl = url.replace(/\s+/g, '');
    if (fixedUrl !== obj.url) changes.图片标签修正++;
    if (obj.alt !== 'image') changes.图片标签修正++;
    return `![image](${fixedUrl})`;
  });

  const leveled = src.split(/\r?\n/).map((line) => {
    let l = line;
    if (/^##\s*第[一二三四五六七八九十百0-9]+章/.test(l)) {
      const nl = '# ' + l.replace(/^##\s*/, '').trim();
      log('标题层级转换', `${l} → ${nl}`);
      return nl;
    }
    if (/^##\s*基礎\s*CHECK\s*$/.test(l)) {
      log('标题层级转换', l + ' → ## 基礎CHECK');
      return '## 基礎CHECK';
    }
    let m = l.match(/^##\s*基本例題\s+(\d+)\s*(.*)$/);
    if (m) {
      const nl = '## 例題' + m[1] + (m[2] ? ' ' + m[2].trim() : '');
      log('标题层级转换', `${l} → ${nl}`);
      return nl;
    }
    m = l.match(/^##\s*基本例题\s+(\d+)\s*(.*)$/);
    if (m) {
      const rawKw = (m[2] || '').trim();
      const kwMap = { '相对速度': '相対速度', '平均の速さと瞬間の速さ': '平均の速さと瞬間の速さ', '速度の合成': '速度の合成', '等加速度直線運動': '等加速度直線運動', '等加速度直線運動のグラフ': '等加速度直線運動のグラフ' };
      const jpKw = kwMap[rawKw] || rawKw;
      const nl = '## 例題' + m[1] + (jpKw ? ' ' + jpKw : '');
      log('OCR误识别修正', `中文例題标题「${l}」 → 「${nl}」`);
      return nl;
    }
    if (/^\s*\(\s*\d+\s*\)\s*$/.test(l)) {
      const nl = '### ' + l.trim();
      return nl;
    }
    return l;
  });
  src = leveled.join('\n');

  const beforeLines = src.split(/\r?\n/).length;
  src = src.replace(/(?:[ \t]*\r?\n){3,}/g, '\n\n');
  src = src.replace(/^\n+/, '').replace(/\n+$/, '\n');
  const afterLines = src.split(/\r?\n/).length;
  changes.空行压缩 = Math.max(0, beforeLines - afterLines);

  return src;
}

function inventory(src) {
  const lines = src.split(/\r?\n/);
  const inv = [];
  let curSect = null;
  let subIdx = 0;
  const exSeen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const l = raw.trim();
    if (/^##\s*基礎CHECK$/.test(l)) { curSect = '基礎CHECK'; subIdx = 0; continue; }
    if (/^##\s*解答\s*$/.test(l)) { curSect = null; continue; }
    if (/^##\s*例題(\d+)/.test(l)) {
      curSect = '例題';
      const n = RegExp.$1;
      if (!exSeen.has('E'+n)) {
        exSeen.add('E'+n);
        inv.push({ no: n, type: '例題' });
      }
      continue;
    }
    if (/^##\s*基本問題\s*$/.test(l)) { curSect = '基本問題'; subIdx = 0; continue; }
    if (/^##\s*リード\s*C/.test(l)) { curSect = '基本問題'; continue; }
    if (/^##\s*応用問題\s*$/.test(l)) { curSect = '応用問題'; subIdx = 0; continue; }
    if (curSect === '基礎CHECK' || curSect === '基本問題' || curSect === '応用問題') {
      const m = l.match(/^[✿◆]?\s*(\d{1,3})\s+\S/);
      if (m) {
        inv.push({ no: m[1], type: curSect });
      }
    }
  }
  return inv;
}

let allInv = null;
for (const f of FILES) {
  const full = path.join(IN_DIR, f);
  const src = fs.readFileSync(full, 'utf8');
  const isAns = /解析/.test(f);
  imgRemoved = 0; imgKept = 0;
  console.log(`\n========== 处理 ${f} ==========`);
  const out = clean(src, isAns);
  const outPath = path.join(IN_DIR, f.replace(/\.md$/, '_cleaned.md'));
  fs.writeFileSync(outPath, out, 'utf8');
  const Lbefore = src.split(/\r?\n/).length;
  const Lafter = out.split(/\r?\n/).length;
  console.log(`行数 ${Lbefore} → ${Lafter}（Δ ${Lafter - Lbefore}）`);
  console.log(`输出: ${outPath}`);
  console.log(`图片保留 ${imgKept} / 删除装饰图 ${imgRemoved}`);
  if (/题目/.test(f)) {
    allInv = inventory(out);
    console.log(`\n清洗后题目共 ${allInv.length} 道：`);
    for (const q of allInv) console.log(`  - ${String(q.type).padEnd(8, ' ')} No.${q.no}`);
  }
}

console.log('\n\n========== 修改内容总览 ==========');
for (const k of Object.keys(changes)) {
  const v = changes[k];
  if (typeof v === 'number') {
    console.log(`【${k}】共 ${v} 处`);
  } else if (v.length) {
    console.log(`【${k}】共 ${v.length} 处：`);
    for (const d of v) console.log('  · ' + d);
  }
}
if (allInv) {
  const byType = {};
  for (const q of allInv) byType[q.type] = (byType[q.type] || 0) + 1;
  console.log('\n========== 题型分布 ==========');
  for (const t of Object.keys(byType)) console.log(`  ${t}: ${byType[t]} 道`);
}
