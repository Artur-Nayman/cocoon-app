import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import audioRoutes from './server/routes/audio.js';
import youtubeRoutes from './server/routes/youtube.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT, 10) || 3000;

  app.use(express.json());

  // Mount API endpoints
  app.use('/api/audio', audioRoutes);
  app.use('/api/youtube', youtubeRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cocoon server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
