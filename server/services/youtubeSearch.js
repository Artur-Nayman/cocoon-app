import { execFileSync } from 'child_process';

export function searchYouTube(query, maxResults = 10) {
  const jsRuntimeRaw = process.env.YT_DLP_JS || '--js-runtimes node';
  const jsRuntimeArgs = jsRuntimeRaw.split(' ').filter(Boolean);

  try {
    const args = [
      ...jsRuntimeArgs,
      '--flat-playlist',
      '--dump-json',
      `ytsearch${maxResults}:${query}`
    ];

    // Using execFileSync avoids shell interpretation of the query,
    // mitigating command injection vulnerabilities.
    // stdio: ['ignore', 'pipe', 'ignore'] mimics the previous 2>/dev/null behavior
    const output = execFileSync('yt-dlp', args, {
      timeout: 30000,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (!output) return [];

    const lines = output.trim().split('\n').filter(Boolean);
    return lines.map((line) => {
      try {
        const item = JSON.parse(line);
        return {
          id: item.id,
          title: item.title || 'Untitled',
          url: item.webpage_url || `https://youtu.be/${item.id}`,
          thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
          duration: item.duration || 0,
          channel: item.channel || item.uploader || 'Unknown',
          description: item.description || '',
        };
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (err) {
    console.warn('[youtubeSearch] yt-dlp search failed:', err.message);
    return [];
  }
}
