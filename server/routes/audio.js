import { Router } from 'express';
import { extractAudioUrl } from '../services/ytdlp.js';

const router = Router();

router.get('/extract', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing "url" query param' });
  }

  try {
    const audioUrl = extractAudioUrl(url);
    if (!audioUrl) {
      return res.status(404).json({ success: false, error: 'Could not extract audio URL' });
    }
    res.json({ success: true, audioUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing "url" in body' });
  }

  try {
    const audioUrl = extractAudioUrl(url);
    if (!audioUrl) {
      return res.status(404).json({ success: false, error: 'Could not extract audio URL' });
    }
    res.json({ success: true, audioUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
