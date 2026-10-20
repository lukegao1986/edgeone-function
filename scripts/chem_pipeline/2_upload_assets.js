const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '../../docs/0 数据准备/Chem');
const META_PATH = path.join(ROOT_DIR, '_meta', 'chem_units.json');
const DEFAULT_MANIFEST_PATH = path.join(ROOT_DIR, '_meta', 'chem_asset_manifest.json');

function parseArgs(argv) {
  const args = {
    units: null,
    manifest: DEFAULT_MANIFEST_PATH,
    prefix: process.env.COS_PREFIX || 'mineru-images',
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--units' && argv[i + 1]) {
      args.units = argv[i + 1].split(',').map((item) => item.trim()).filter(Boolean);
      i += 1;
      continue;
    }

    if (token === '--manifest' && argv[i + 1]) {
      args.manifest = path.resolve(argv[i + 1]);
      i += 1;
      continue;
    }

    if (token === '--prefix' && argv[i + 1]) {
      args.prefix = argv[i + 1].trim();
      i += 1;
      continue;
    }

    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (token === '--force') {
      args.force = true;
    }
  }

  return args;
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getRequiredConfig(args) {
  return {
    secretId: process.env.COS_SECRET_ID || '',
    secretKey: process.env.COS_SECRET_KEY || '',
    bucket: process.env.COS_BUCKET || '',
    region: process.env.COS_REGION || '',
    prefix: args.prefix || '',
    publicBaseUrl: (process.env.COS_PUBLIC_BASE_URL || '').replace(/\/$/, ''),
  };
}

function validateConfig(config, dryRun) {
  const required = ['bucket', 'region', 'prefix', 'publicBaseUrl'];
  if (!dryRun) {
    required.push('secretId', 'secretKey');
  }

  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`);
  }
}

function createCosClient(config, dryRun) {
  if (dryRun) return null;
  return {
    bucket: config.bucket,
    region: config.region,
    secretId: config.secretId,
    secretKey: config.secretKey,
  };
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function buildObjectKey(prefix, sha, ext) {
  return `${prefix.replace(/\/$/, '')}/${sha}${ext}`;
}

function buildPublicUrl(publicBaseUrl, objectKey) {
  return `${publicBaseUrl}/${objectKey}`.replace(/([^:]\/)\/+/g, '$1');
}

function sha1(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

function hmacSha1(key, content) {
  return crypto.createHmac('sha1', key).update(content).digest('hex');
}

function buildCosAuthorization({ secretId, secretKey, host, method, pathname }) {
  const now = Math.floor(Date.now() / 1000);
  const expired = now + 3600;
  const keyTime = `${now};${expired}`;
  const signKey = hmacSha1(secretKey, keyTime);
  const headerList = 'host';
  const httpHeaders = `host=${host.toLowerCase()}\n`;
  const formatString = `${method.toLowerCase()}\n${pathname}\n\n${httpHeaders}`;
  const stringToSign = `sha1\n${keyTime}\n${sha1(formatString)}\n`;
  const signature = hmacSha1(signKey, stringToSign);
  return `q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=${headerList}&q-url-param-list=&q-signature=${signature}`;
}

function extractMarkdownUrlsFromLine(line) {
  const urls = [];
  let cursor = 0;

  while (cursor < line.length) {
    const start = line.indexOf('![', cursor);
    if (start === -1) break;

    const open = line.indexOf('](', start);
    if (open === -1) break;

    let i = open + 2;
    let depth = 1;
    while (i < line.length && depth > 0) {
      const ch = line[i];
      if (ch === '(') depth += 1;
      if (ch === ')') depth -= 1;
      i += 1;
    }

    if (depth === 0) {
      const url = line.slice(open + 2, i - 1).trim();
      if (url) urls.push(url);
      cursor = i;
    } else {
      break;
    }
  }

  return urls;
}

function extractHtmlImgUrlsFromLine(line) {
  const urls = [];
  const regex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const url = (match[1] || '').trim();
    if (url) urls.push(url);
  }
  return urls;
}

function scanFileRefs(unitCode, filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const refs = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    const urls = [
      ...extractMarkdownUrlsFromLine(line),
      ...extractHtmlImgUrlsFromLine(line),
    ];

    for (const url of urls) {
      if (!url.startsWith('/')) continue;
      refs.push({
        unitCode,
        filePath,
        originalUrl: url,
        lineHint: index + 1,
      });
    }
  });

  return refs;
}

function collectRefs(units) {
  const refs = [];

  for (const unit of units) {
    for (const key of ['cleanedQuestionFile', 'cleanedAnalysisFile']) {
      const filePath = unit.paths[key];
      if (!filePath || !fs.existsSync(filePath)) continue;
      refs.push(...scanFileRefs(unit.unitCode, filePath));
    }
  }

  return refs;
}

function uploadFile(cos, config, localPath, objectKey) {
  const fileBuffer = fs.readFileSync(localPath);
  const host = `${config.bucket}.cos.${config.region}.myqcloud.com`;
  const pathname = `/${objectKey}`;
  const authorization = buildCosAuthorization({
    secretId: config.secretId,
    secretKey: config.secretKey,
    host,
    method: 'PUT',
    pathname,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        method: 'PUT',
        path: pathname,
        headers: {
          Host: host,
          Authorization: authorization,
          'Content-Length': fileBuffer.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              statusCode: res.statusCode,
              ETag: res.headers.etag || null,
              body,
            });
            return;
          }
          reject(new Error(`COS upload failed: ${res.statusCode} ${body}`));
        });
      },
    );

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

async function uploadWithRetry(cos, config, localPath, objectKey, attempts = 3) {
  let lastError = null;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await uploadFile(cos, config, localPath, objectKey);
    } catch (error) {
      lastError = error;
      if (i === attempts) break;
    }
  }
  throw lastError;
}

function replaceUrlsInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return false;
  let text = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [from, to] of replacements.entries()) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, text, 'utf8');
  }

  return changed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = getRequiredConfig(args);
  validateConfig(config, args.dryRun);

  const index = loadJson(META_PATH, null);
  if (!index) {
    throw new Error(`Step 0 output not found: ${META_PATH}`);
  }

  const selectedUnits = args.units
    ? index.units.filter((unit) => args.units.includes(unit.unitCode))
    : index.units;

  if (selectedUnits.length === 0) {
    throw new Error('No units matched the provided --units filter.');
  }

  const existingManifest = loadJson(args.manifest, {
    version: 1,
    generatedAt: '',
    bucket: config.bucket,
    region: config.region,
    prefix: config.prefix,
    publicBaseUrl: config.publicBaseUrl,
    assets: [],
    errors: [],
  });

  const assetCache = new Map();
  for (const asset of existingManifest.assets || []) {
    if (asset.sha256 && asset.status && ['uploaded', 'reused'].includes(asset.status)) {
      assetCache.set(asset.sha256, asset);
    }
  }

  const refs = collectRefs(selectedUnits);
  const refsByUrl = new Map();
  for (const ref of refs) {
    if (!refsByUrl.has(ref.originalUrl)) refsByUrl.set(ref.originalUrl, []);
    refsByUrl.get(ref.originalUrl).push(ref);
  }

  const cos = createCosClient(config, args.dryRun);
  const assets = [];
  const errors = [];
  const replacements = new Map();

  for (const [localPath, refList] of refsByUrl.entries()) {
    if (!fs.existsSync(localPath)) {
      errors.push({
        filePath: refList[0].filePath,
        originalUrl: localPath,
        reason: 'file_not_found',
      });
      continue;
    }

    const ext = path.extname(localPath) || '';
    const size = fs.statSync(localPath).size;
    const sha256 = sha256File(localPath);
    const objectKey = buildObjectKey(config.prefix, sha256, ext);
    const publicUrl = buildPublicUrl(config.publicBaseUrl, objectKey);
    const cached = assetCache.get(sha256);

    const assetRecord = {
      assetId: `sha256:${sha256}`,
      sha256,
      ext,
      size,
      localPath,
      objectKey,
      publicUrl,
      etag: cached ? cached.etag || null : null,
      status: 'planned',
      refs: refList,
    };

    if (cached && !args.force) {
      assetRecord.status = 'reused';
      replacements.set(localPath, publicUrl);
      assets.push(assetRecord);
      continue;
    }

    if (args.dryRun) {
      assetRecord.status = 'planned';
      assets.push(assetRecord);
      continue;
    }

    try {
      const result = await uploadWithRetry(cos, config, localPath, objectKey);
      assetRecord.status = 'uploaded';
      assetRecord.etag = result.ETag || result.etag || null;
      replacements.set(localPath, publicUrl);
    } catch (error) {
      assetRecord.status = 'failed';
      errors.push({
        filePath: refList[0].filePath,
        originalUrl: localPath,
        reason: error.message || 'upload_failed',
      });
    }

    assets.push(assetRecord);
  }

  if (!args.dryRun) {
    for (const unit of selectedUnits) {
      for (const key of ['cleanedQuestionFile', 'cleanedAnalysisFile']) {
        const filePath = unit.paths[key];
        if (!filePath || !fs.existsSync(filePath)) continue;
        replaceUrlsInFile(filePath, replacements);
      }
    }
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    bucket: config.bucket,
    region: config.region,
    prefix: config.prefix,
    publicBaseUrl: config.publicBaseUrl,
    assets,
    errors,
  };

  ensureDir(path.dirname(args.manifest));
  fs.writeFileSync(args.manifest, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`Processed units: ${selectedUnits.length}`);
  console.log(`Scanned refs: ${refs.length}`);
  console.log(`Unique local assets: ${refsByUrl.size}`);
  console.log(`Manifest: ${args.manifest}`);
  console.log(`Dry run: ${args.dryRun}`);
  console.log(`Assets uploaded/reused/planned/failed: ${assets.filter(a => a.status === 'uploaded').length}/${assets.filter(a => a.status === 'reused').length}/${assets.filter(a => a.status === 'planned').length}/${assets.filter(a => a.status === 'failed').length}`);
  console.log(`Errors: ${errors.length}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
