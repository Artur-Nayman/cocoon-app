// Live check against real yt-dlp + YouTube. Needs vendor/yt-dlp (node scripts/fetch-ytdlp.mjs).
// Run: npm run test:ytdlp  (network; separate from the offline unit tests)
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { extractAudioUrl } from '../server/services/ytdlp.js';

const bin = path.resolve('vendor', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
process.env.YT_DLP_PATH = bin;
const VIDEO = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'; // "Me at the zoo", stable

describe('yt-dlp live', () => {
  it('binary runs', () => {
    expect(execFileSync(bin, ['--version'], { encoding: 'utf-8' }).trim()).toMatch(/^\d{4}\.\d{2}\.\d{2}/);
  });

  // ponytail: YouTube may block CI IPs; workflow runs this one non-blocking
  it('extracts a playable audio URL', async () => {
    expect(await extractAudioUrl(VIDEO)).toMatch(/^https?:\/\//);
  }, 90000);
});
