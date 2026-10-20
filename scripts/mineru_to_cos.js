const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const BUCKET = 'shuati-images-1317494834';
const REGION = 'ap-shanghai';
const COS_DIR = 'mineru-images';

const inputFile = process.argv[2];
const imagesDir = process.argv[3];

if (!inputFile || !imagesDir) {
  console.log('❌ 缺少参数');
  console.log('用法: node scripts/mineru_to_cos.js <json或md文件路径> <本地images目录路径>');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputFile);
const imagesDirPath = path.resolve(process.cwd(), imagesDir);

if (!fs.existsSync(inputPath)) {
  console.error(`❌ 找不到输入文件: ${inputPath}`);
  process.exit(1);
}

if (!fs.existsSync(imagesDirPath)) {
  console.error(`❌ 找不到图片目录: ${imagesDirPath}`);
  process.exit(1);
}

const content = fs.readFileSync(inputPath, 'utf8');
const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

function collectMarkdownImages(text) {
  const results = [];
  let match;

  while ((match = markdownImageRegex.exec(text)) !== null) {
    results.push({
      fullMatch: match[0],
      alt: match[1],
      url: match[2],
    });
  }

  return results;
}

function buildCosUrl(location) {
  return location.startsWith('http') ? location : `https://${location}`;
}

function getFilenameFromUrl(url) {
  const cleanUrl = url.split('?')[0];
  return cleanUrl.split('/').pop();
}

function uploadFileToCos(localFilePath, cosKey) {
  return new Promise((resolve, reject) => {
    cos.sliceUploadFile(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: cosKey,
        FilePath: localFilePath,
      },
      (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      }
    );
  });
}

async function main() {
  console.log(`🔍 扫描文件: ${inputPath}`);
  const imageMatches = collectMarkdownImages(content);

  if (imageMatches.length === 0) {
    console.log('✅ 没有发现 Markdown 图片链接，无需处理');
    return;
  }

  const uniqueUrls = [...new Set(imageMatches.map((item) => item.url))];
  const replaceMap = new Map();

  console.log(`📌 共发现 ${imageMatches.length} 处图片引用，去重后 ${uniqueUrls.length} 个链接`);

  for (const oldUrl of uniqueUrls) {
    if (oldUrl.includes('myqcloud.com') || oldUrl.includes(BUCKET)) {
      console.log(`⏩ 已是 COS 链接，跳过: ${oldUrl}`);
      continue;
    }

    const filename = getFilenameFromUrl(oldUrl);
    if (!filename) {
      console.warn(`⚠️ 无法从链接提取文件名，跳过: ${oldUrl}`);
      continue;
    }

    const localImagePath = path.join(imagesDirPath, filename);
    if (!fs.existsSync(localImagePath)) {
      console.warn(`⚠️ 本地未找到对应图片，跳过: ${localImagePath}`);
      continue;
    }

    const cosKey = `${COS_DIR}/${filename}`;
    console.log(`⬆️ 上传中: ${filename}`);

    try {
      const result = await uploadFileToCos(localImagePath, cosKey);
      const newUrl = buildCosUrl(result.Location);
      replaceMap.set(oldUrl, newUrl);
      console.log(`✔️ 上传成功: ${newUrl}`);
    } catch (error) {
      console.error(`❌ 上传失败: ${filename}`);
      console.error(error.message);
    }
  }

  let updatedContent = content;
  for (const [oldUrl, newUrl] of replaceMap.entries()) {
    updatedContent = updatedContent.split(oldUrl).join(newUrl);
  }

  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const outputPath = path.join(path.dirname(inputPath), `${baseName}_cos${ext}`);

  fs.writeFileSync(outputPath, updatedContent, 'utf8');

  console.log('');
  console.log(`🎉 处理完成`);
  console.log(`原文件: ${inputPath}`);
  console.log(`新文件: ${outputPath}`);
  console.log(`成功替换: ${replaceMap.size} 个图片链接`);
}

main().catch((error) => {
  console.error('❌ 脚本执行失败');
  console.error(error);
  process.exit(1);
});
