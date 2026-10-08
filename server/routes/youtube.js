import { Router } from 'express';
import { searchYouTube } from '../services/youtubeSearch.js';

const router = Router();

const searchCache = new Map();
const MAX_CACHE_SIZE = 100;

router.get('/search', async (req, res) => {
  const { q, max } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ success: false, error: 'Missing "q" query param' });
  }

  try {
    const query = q.trim();
    const maxResults = Number(max) || 10;
    const cacheKey = `${query}:${maxResults}`;

    if (searchCache.has(cacheKey)) {
      return res.json({ success: true, results: searchCache.get(cacheKey) });
    }

    const results = searchYouTube(query, maxResults);

    searchCache.set(cacheKey, results);
    if (searchCache.size > MAX_CACHE_SIZE) {
      // Map keys are ordered by insertion time. Getting the first key
      // gives us the oldest inserted item to remove (FIFO).
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
