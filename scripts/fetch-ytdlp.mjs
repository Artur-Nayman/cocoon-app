// Downloads the standalone yt-dlp binary into vendor/ so it can be shipped
// via electron-builder extraResources. Run before packaging: `node scripts/fetch-ytdlp.mjs [win|linux|mac|all]`.
import { createWriteStream, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vendorDir = path.resolve(__dirname, '../vendor');
mkdirSync(vendorDir, { recursive: true });

const TARGETS = {
  win: { file: 'yt-dlp.exe', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', exec: false },
  linux: { file: 'yt-dlp', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp', exec: true },
  mac: { file: 'yt-dlp', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos', exec: true },
};

const defaultTarget = () =>
  process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux';

const arg = process.argv[2] || defaultTarget();
const names = arg === 'all' ? ['win', 'linux'] : [arg];

for (const name of names) {
  const target = TARGETS[name];
  if (!target) {
    console.error(`fetch-ytdlp: unknown target "${name}" (expected win|linux|mac|all)`);
    process.exit(1);
  }
  const dest = path.join(vendorDir, target.file);
  if (existsSync(dest)) {
    console.log(`fetch-ytdlp: ${target.file} already present, skipping`);
    continue;
  }
  console.log(`fetch-ytdlp: downloading ${target.file}...`);
  const res = await fetch(target.url, { redirect: 'follow' });
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  if (target.exec) chmodSync(dest, 0o755);
  console.log(`fetch-ytdlp: saved ${dest}`);
}
