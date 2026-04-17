import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth.js';
import { query } from '../db.js';
import { requireAuth } from '../middleware.js';

export const authRouter = Router();

interface UserRow {
  user_id: string;
  name: string;
  role: 'admin' | 'user';
  pin_hash: string;
}

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

authRouter.post('/login', async (req, res) => {
  if (rateLimited(req.ip ?? 'unknown')) {
    return res.status(429).json({ error: 'Too many attempts' });
  }
  const { user_id: userId, pin } = req.body ?? {};
  if (typeof userId !== 'string' || typeof pin !== 'string') {
    return res.status(400).json({ error: 'user_id and pin required' });
  }
  const { rows } = await query<UserRow>(
    'SELECT user_id, name, role, pin_hash FROM users WHERE user_id = $1',
    [userId]
  );
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(pin, rows[0].pin_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const user = { id: rows[0].user_id, name: rows[0].name, role: rows[0].role };
  const token = signToken({ sub: user.id, name: user.name, role: user.role });
  return res.json({ token, user });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const u = req.user!;
  res.json({ user: { id: u.sub, name: u.name, role: u.role } });
});
