import { BACKEND_URL } from '../config';

export async function searchYouTube(query) {
  const res = await fetch(`${BACKEND_URL}/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
  const data = await res.json();
  return data.success ? data.results : [];
}
