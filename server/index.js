import express from 'express';
import cors from 'cors';
import audioRoutes from './routes/audio.js';
import youtubeRoutes from './routes/youtube.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/audio', audioRoutes);
app.use('/api/youtube', youtubeRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Cocoon server listening on http://localhost:${PORT}`);
});
