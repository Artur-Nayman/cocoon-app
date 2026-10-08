import { execSync } from 'child_process';

export function extractAudioUrl(youtubeUrl) {
  // Try best audio format — for regular videos this returns a direct playable URL
  // For live streams this may return an HLS URL
  const strategies = [
    // Strategy 1: best audio, prefer direct HTTP streams over DASH segments
    `--format "bestaudio[protocol!=http_dash_segments]" --get-url`,
    // Strategy 2: fallback to any best audio
    `--format "bestaudio" --get-url`,
    // Strategy 3: extract audio as mp3 (works for non-live)
    `--extract-audio --audio-format mp3 --get-url`,
    // Strategy 4: raw URL (works for live streams — returns HLS manifest)
    `--get-url`,
  ];

  const jsRuntime = process.env.YT_DLP_JS || '--js-runtimes node';

  for (const flags of strategies) {
    try {
      const cmd = `yt-dlp ${jsRuntime} ${flags} "${youtubeUrl}" 2>/dev/null`;
      const output = execSync(cmd, { timeout: 30000, encoding: 'utf-8' }).trim();
      const lines = output.split('\n').filter(Boolean);
      const url = lines[0];
      if (url && url.startsWith('http')) return url;
    } catch {
      continue;
    }
  }

  return null;
}
