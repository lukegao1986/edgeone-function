#!/usr/bin/env node
/**
 * upload_assets.js — S4 制作层：封面 / 内页 / 视频上传 COS（设计文档 §7）
 *
 * 用法：
 *   node scripts/contentops/upload_assets.js <topicId>
 *   node scripts/contentops/upload_assets.js <topicId> --dry
 *
 * 依赖：COS_SECRET_ID / COS_SECRET_KEY / COS_BUCKET / COS_REGION（写在项目 .env）
 * 复用 scripts/mineru_to_cos.js 的变量命名，严禁硬编码密钥
 * 上传后写回 packages/<topicId>/assets/urls.json，供 01_blog.md 引用绝对 URL
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { P, packageDir, exists, writeJSON } = require('./lib/paths');
const { C, hasEnv, gate, loadEnv } = require('./lib/pre');

loadEnv(P.ROOT);

const BUCKET = process.env.COS_BUCKET || 'shuati-images-1317494834';
const REGION = process.env.COS_REGION || 'ap-shanghai';
const COS_DIR = process.env.COS_CONTENT_DIR || 'content-ops';

const EXT_TYPE = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.webp': 'image/webp' };

function listAssets(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => EXT_TYPE[path.extname(f).toLowerCase()]);
}

async function main() {
  const argv = process.argv.slice(2);
  const topicId = argv.find((a) => !a.startsWith('--'));
  const dry = argv.includes('--dry');
  if (!topicId) { console.log('用法: node scripts/contentops/upload_assets.js <topicId> [--dry]'); process.exit(2); }

  const assetDir = path.join(packageDir(topicId), 'assets');
  const files = listAssets(assetDir);
  if (!files.length) {
    console.log(C.red(`✗ ${assetDir} 下没有可上传的素材`));
    console.log(C.dim('  先跑：node scripts/contentops/render_covers.js ' + topicId));
    process.exit(2);
  }

  if (dry) {
    console.log(C.bold(`\n将上传 ${files.length} 个文件到 cos://${BUCKET}/${COS_DIR}/${topicId}/`));
    files.forEach((f) => console.log('  ' + f));
    return;
  }

  const ok = gate({
    name: 'upload_assets.js',
    purpose: '素材上传 COS，回写绝对 URL',
    needs: [
      { label: 'COS_SECRET_ID 已配置', ok: hasEnv('COS_SECRET_ID'), fix: '腾讯云 CAM 建子账号密钥 → 写进 .env' },
      { label: 'COS_SECRET_KEY 已配置', ok: hasEnv('COS_SECRET_KEY'), fix: '同上，只给该桶的读写权限' },
      { label: 'cos-nodejs-sdk-v5 已安装', ok: (() => { try { require.resolve('cos-nodejs-sdk-v5'); return true; } catch { return false; } })(), fix: 'npm i cos-nodejs-sdk-v5' },
    ],
  });
  if (!ok) process.exit(1);

  const COS = require('cos-nodejs-sdk-v5');
  const cos = new COS({ SecretId: process.env.COS_SECRET_ID, SecretKey: process.env.COS_SECRET_KEY });

  const urls = {};
  let done = 0;
  for (const f of files) {
    const key = `${COS_DIR}/${topicId}/${f}`;
    const local = path.join(assetDir, f);
    const Body = fs.createReadStream(local);
    await cos.putObject({
      Bucket: BUCKET, Region: REGION, Key: key, Body,
      ContentType: EXT_TYPE[path.extname(f).toLowerCase()] || 'application/octet-stream',
    });
    urls[f] = `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`;
    done++;
    console.log(C.green(`  ✓ ${f}`));
    console.log(C.dim('    ' + urls[f]));
  }

  writeJSON(path.join(assetDir, 'urls.json'), { topicId, bucket: BUCKET, region: REGION, uploadedAt: new Date().toISOString(), urls });
  console.log(`\n上传 ${done} 个文件 → assets/urls.json`);
  console.log(C.dim('01_blog.md 里的图片必须换成这里的绝对 URL，publish_blog.js 会校验'));
}

main().catch((e) => { console.error(C.red('✗ 上传失败: ' + e.message)); process.exit(1); });
