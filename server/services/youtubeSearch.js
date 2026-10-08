import { execSync } from 'child_process';

function parseDuration(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export async function searchYouTube(query, maxResults = 10) {
  const safeQuery = query.replace(/"/g, '\\"');
  const jsRuntime = process.env.YT_DLP_JS || '--js-runtimes node';

  // 1. Try yt-dlp first if available
  try {
    const cmd = `yt-dlp ${jsRuntime} --flat-playlist --dump-json "ytsearch${maxResults}:${safeQuery}" 2>/dev/null`;
    const output = execSync(cmd, { timeout: 30000, encoding: 'utf-8' }).trim();
    if (output) {
      const lines = output.trim().split('\n').filter(Boolean);
      const results = lines.map((line) => {
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

      if (results.length > 0) return results;
    }
  } catch {
    // yt-dlp unavailable or failed, fallback to direct search
  }

  // 2. Fallback: web scrape YouTube search results
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.+?});<\/script>/) || html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const sectionContents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    const results = [];
    for (const section of sectionContents) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const v = item.videoRenderer;
        if (!v || !v.videoId) continue;
        const durationText = v.lengthText?.simpleText || '';
        results.push({
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || 'Untitled',
          url: `https://youtu.be/${v.videoId}`,
          thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          duration: parseDuration(durationText),
          channel: v.ownerText?.runs?.[0]?.text || 'YouTube',
          description: v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r) => r.text).join('') || '',
        });
        if (results.length >= maxResults) break;
      }
      if (results.length >= maxResults) break;
    }
    return results;
  } catch (err) {
    console.warn('[youtubeSearch] fallback search failed:', err.message);
    return [];
  }
}
