import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { query } from './db.js';

interface SeedUser {
  id: string;
  name: string;
  role: 'admin' | 'user';
  pin: string | undefined;
}

export async function seedUsers() {
  const users: SeedUser[] = [
    { id: 'karrie', name: 'Karrie', role: 'user', pin: env.pinKarrie },
    { id: 'eric', name: 'Eric', role: 'admin', pin: env.pinEric }
  ];

  for (const u of users) {
    if (!u.pin) {
      console.warn(`[seed] PIN for ${u.id} not set; skipping`);
      continue;
    }
    const hash = await bcrypt.hash(u.pin, 10);
    await query(
      `INSERT INTO users (user_id, name, role, pin_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, pin_hash = EXCLUDED.pin_hash`,
      [u.id, u.name, u.role, hash]
    );
  }
}
