import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { seedUsers } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

if (env.nodeEnv === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function start() {
  await seedUsers();
  app.listen(env.port, () => {
    console.log(`[kk v2] server listening on :${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
