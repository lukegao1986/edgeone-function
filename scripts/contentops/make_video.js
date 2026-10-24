#!/usr/bin/env node
/**
 * make_video.js — S4 制作层：ffmpeg 生成 V1 图文滚屏视频（设计文档 §7.3）
 *
 * 用法：
 *   node scripts/contentops/make_video.js <topicId> [--platform xhs|douyin]
 *   node scripts/contentops/make_video.js <topicId> --plan     # 只打印 ffmpeg 命令，不执行
 *
 * 三种形态（6:3:1 配比）：
 *   V1 图文滚屏  封面序列 + Ken Burns + 字幕 + BGM   3 min   自动化 90%
 *   V2 白板讲解  录屏 + 口播 + 手写批注              3–5 min 自动化 30%（必须你亲自讲）
 *   V3 真人口播  出镜                               1–2 min 自动化 10%
 * 本脚本只做 V1。V2/V3 是差异化主力，人工录。
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { packageDir } = require('./lib/paths');
const { C, hasBin, gate } = require('./lib/pre');

const CANVAS = {
  xhs: { w: 1080, h: 1440, note: '小红书 3:4' },
  douyin: { w: 1080, h: 1920, note: '抖音/视频号 9:16' },
};

function plan(topicId, platform, images) {
  const cv = CANVAS[platform];
  const tmp = path.join(os.tmpdir(), `eju-vid-${topicId}`);
  const cmds = [];
  const parts = [];
  const D = 4; // 每张图 4 秒
  images.forEach((img, i) => {
    const out = path.join(tmp, `part-${String(i).padStart(2, '0')}.mp4`);
    parts.push(out);
    cmds.push(
      `ffmpeg -y -loop 1 -i "${img}" ` +
      `-vf "scale=${cv.w}:${cv.h}:force_original_aspect_ratio=increase,crop=${cv.w}:${cv.h},` +
      `zoompan=z='min(zoom+0.0008,1.12)':d=${D * 25}:s=${cv.w}x${cv.h}:fps=25,format=yuv420p" ` +
      `-t ${D} -c:v libx264 -pix_fmt yuv420p "${out}"`
    );
  });
  const list = path.join(tmp, 'concat.txt');
  cmds.push(`printf "%s\\n" ${parts.map((p) => `file '${p}'`).join(' ')} > "${list}"`);
  const final = path.join(packageDir(topicId), 'assets', `video-V1-${platform}.mp4`);
  cmds.push(`ffmpeg -y -f concat -safe 0 -i "${list}" -c copy "${final}"`);
  return { cmds, tmp, final };
}

function main() {
  const argv = process.argv.slice(2);
  const topicId = argv.find((a) => !a.startsWith('--'));
  if (!topicId) { console.log('用法: node scripts/contentops/make_video.js <topicId> [--platform xhs|douyin] [--plan]'); process.exit(2); }

  const platform = ((argv.find((a) => a.startsWith('--platform=')) || '').split('=')[1]) || 'xhs';
  const assetDir = path.join(packageDir(topicId), 'assets');
  const images = fs.existsSync(assetDir)
    ? fs.readdirSync(assetDir).filter((f) => /^cover-.*\.png$/.test(f)).sort().map((f) => path.join(assetDir, f))
    : [];

  if (!images.length) {
    console.log(C.red(`✗ ${assetDir} 下没有封面，先跑 render_covers.js`));
    process.exit(2);
  }

  const { cmds, tmp, final } = plan(topicId, platform, images);
  console.log(C.bold(`\nV1 图文滚屏 · ${topicId} · ${platform}（${CANVAS[platform].note}）`));
  console.log(C.dim(`  ${images.length} 张封面 × 4 秒 ≈ ${images.length * 4} 秒`));

  if (argv.includes('--plan')) {
    cmds.forEach((c) => console.log('  ' + c));
    return;
  }

  const ok = gate({
    name: 'make_video.js',
    purpose: 'ffmpeg 合成 V1 图文视频',
    needs: [
      { label: 'ffmpeg 已安装', ok: hasBin('ffmpeg'), fix: 'brew install ffmpeg' },
      { label: '封面素材已渲染', ok: images.length > 0, fix: 'node scripts/contentops/render_covers.js ' + topicId },
    ],
    todo: [
      '加字幕：把 03_video.md 的文本做成 .srt，用 subtitles 滤镜烧进画面',
      '加 BGM：注意版权，优先用平台自带曲库，不要本地塞热门歌',
      'V1 只适合清单/对比类；真题讲解必须走 V2（你亲自讲才有差异化）',
      '抖音/视频号要 9:16，封面得单独出一套，别直接拉伸缩放',
    ],
  });
  if (!ok) process.exit(1);

  fs.mkdirSync(tmp, { recursive: true });
  fs.mkdirSync(path.dirname(final), { recursive: true });
  for (const c of cmds) execSync(c, { stdio: 'inherit', shell: '/bin/bash' });
  console.log(C.green(`\n✓ 产出 ${final}`));
}

main();
