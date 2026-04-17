import { Router } from 'express';
import { query } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: true });
  } catch {
    res.status(503).json({ ok: false, db: false });
  }
});
