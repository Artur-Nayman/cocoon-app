import { Router } from 'express';
import { searchYouTube } from '../services/youtubeSearch.js';

const router = Router();

router.get('/search', async (req, res) => {
  const { q, max } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ success: false, error: 'Missing "q" query param' });
  }

  try {
    const results = searchYouTube(q.trim(), Number(max) || 10);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
