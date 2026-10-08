import { execSync } from 'child_process';

export function searchYouTube(query, maxResults = 10) {
  const safeQuery = query.replace(/"/g, '\\"');
  const jsRuntime = process.env.YT_DLP_JS || '--js-runtimes node';

  try {
    const cmd = `yt-dlp ${jsRuntime} --flat-playlist --dump-json "ytsearch${maxResults}:${safeQuery}" 2>/dev/null`;
    const output = execSync(cmd, { timeout: 30000, encoding: 'utf-8' }).trim();
    if (!output) return [];

    const lines = output.split('\n').filter(Boolean);
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
