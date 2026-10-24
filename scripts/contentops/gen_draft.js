#!/usr/bin/env node
/**
 * gen_draft.js — S3 草案层：调 Dify 工作流，一个选题出四份文件（设计文档 §6.1）
 *
 * 用法：
 *   node scripts/contentops/gen_draft.js <topicId>
 *   node scripts/contentops/gen_draft.js <topicId> --dry   # 只打印将要发送的输入，不调用
 *
 * 依赖：DIFY_API_BASE / DIFY_API_KEY（写在项目 .env）
 * Dify 工作流五步：事实提取 → 长文 → 笔记 → 口播 → 封面变量
 * 工作流 outputs 需包含：blog_md / xhs_md / video_md / brief_json
 *
 * 产出：packages/<topicId>/ 01_blog.md  02_xhs.md  03_video.md  04_brief.json
 * 产出后必经 factcheck.js，标红不得进 G2
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { P, pkgFile, packageDir, exists, readJSON } = require('./lib/paths');
const { C, hasEnv, gate, loadEnv } = require('./lib/pre');

loadEnv(P.ROOT);

const OUTPUT_MAP = {
  '01_blog.md': 'blog_md',
  '02_xhs.md': 'xhs_md',
  '03_video.md': 'video_md',
  '04_brief.json': 'brief_json',
};

function callDify(base, key, inputs) {
  const body = JSON.stringify({ inputs, response_mode: 'blocking', user: 'contentops' });
  const tmp = path.join(require('os').tmpdir(), 'dify-body.json');
  fs.writeFileSync(tmp, body, 'utf8');
  const out = execFileSync('curl', [
    '-sS', '-X', 'POST', `${base}/v1/workflows/run`,
    '-H', `Authorization: Bearer ${key}`,
    '-H', 'Content-Type: application/json',
    '--data-binary', `@${tmp}`,
    '--max-time', '180',
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  fs.unlinkSync(tmp);
  const j = JSON.parse(out);
  if (j.code && j.code !== 0) throw new Error(`Dify 返回错误：${j.message}`);
  return (j.data && j.data.outputs) || j.outputs || {};
}

function main() {
  const argv = process.argv.slice(2);
  const topicId = argv.find((a) => !a.startsWith('--'));
  const dry = argv.includes('--dry');
  if (!topicId) { console.log('用法: node scripts/contentops/gen_draft.js <topicId> [--dry]'); process.exit(2); }

  const topicPath = pkgFile(topicId, '00_topic.json');
  const topic = exists(topicPath) ? readJSON(topicPath) : { topicId, 标题: topicId };

  if (dry) {
    console.log(C.bold('\n将要发给 Dify 的输入（--dry，不调用）'));
    console.log(JSON.stringify({ topic, category: topic.category, intent: topic.intent }, null, 2));
    return;
  }

  const ok = gate({
    name: 'gen_draft.js',
    purpose: '调 Dify 出四份草案',
    needs: [
      { label: 'DIFY_API_BASE 已配置', ok: hasEnv('DIFY_API_BASE'), fix: '在 .env 写 DIFY_API_BASE=http://localhost:80（或你的 Dify 地址）' },
      { label: 'DIFY_API_KEY 已配置', ok: hasEnv('DIFY_API_KEY'), fix: 'Dify 工作流 → API 访问 → 生成密钥' },
      { label: '选题元数据 00_topic.json', ok: exists(topicPath), fix: `先建 ${topicPath}（可从 Base 选题池同步）` },
    ],
    todo: [
      'Dify 里建五步工作流，outputs 键名必须与 OUTPUT_MAP 对齐',
      'Prompt 三条例行写进 system：禁承诺词 / 禁 AI 味句式 / 数字必须追溯到 facts',
      'Prompt 改一次记一次 99_review.md，版本号进文件名',
      'G2 审批卡片由 n8n 推飞书，本脚本只管产出文件',
    ],
  });
  if (!ok) process.exit(1);

  const base = process.env.DIFY_API_BASE.replace(/\/+$/, '');
  const outputs = callDify(base, process.env.DIFY_API_KEY, {
    topicId, title: topic.标题 || topic.title || '', category: topic.category || '', intent: topic.intent || '',
    sourceIds: (topic.sources || []).join(','),
  });

  const dir = packageDir(topicId);
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const [file, key] of Object.entries(OUTPUT_MAP)) {
    if (outputs[key] == null) { console.log(C.yellow(`  △ Dify 未返回 ${key}`)); continue; }
    fs.writeFileSync(path.join(dir, file), String(outputs[key]), 'utf8');
    console.log(C.green(`  ✓ ${file}`));
    n++;
  }
  console.log(`\n产出 ${n} 份 → ${dir}`);
  console.log(C.dim('下一步：node scripts/contentops/factcheck.js ' + topicId));
}

main();
