const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

/* ── Database ── */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        pin_hash TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sync_data (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, key)
      );
    `);

    // Seed users from env vars if they don't exist
    const pins = {
      eric: process.env.PIN_ERIC,
      karrie: process.env.PIN_KARRIE
    };
    for (const [id, pin] of Object.entries(pins)) {
      if (!pin) continue;
      const exists = await client.query('SELECT 1 FROM users WHERE user_id=$1', [id]);
      if (exists.rows.length === 0) {
        const hash = await bcrypt.hash(pin, 10);
        await client.query('INSERT INTO users (user_id, pin_hash) VALUES ($1, $2)', [id, hash]);
        console.log(`Seeded user: ${id}`);
      }
    }
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

/* ── Auth ── */
app.post('/api/login', async (req, res) => {
  const { pin } = req.body || {};
  if (!pin) return res.status(400).json({ error: 'PIN required' });

  try {
    const result = await pool.query('SELECT user_id, pin_hash FROM users');
    for (const row of result.rows) {
      if (await bcrypt.compare(String(pin), row.pin_hash)) {
        return res.json({ user_id: row.user_id });
      }
    }
    return res.status(401).json({ error: 'Invalid PIN' });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ── Sync: Pull ── */
app.get('/api/sync/:userId', async (req, res) => {
  const { userId } = req.params;
  const since = req.query.since || null;

  try {
    let result;
    if (since) {
      result = await pool.query(
        'SELECT key, value, updated_at FROM sync_data WHERE user_id=$1 AND updated_at > $2',
        [userId, since]
      );
    } else {
      result = await pool.query(
        'SELECT key, value, updated_at FROM sync_data WHERE user_id=$1',
        [userId]
      );
    }
    return res.json({ data: result.rows });
  } catch (e) {
    console.error('Sync pull error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ── Sync: Push ── */
app.put('/api/sync/:userId', async (req, res) => {
  const { userId } = req.params;
  const { items } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'items array required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const now = new Date().toISOString();
    for (const item of items) {
      await client.query(
        `INSERT INTO sync_data (user_id, key, value, updated_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        [userId, item.key, item.value, now]
      );
    }
    await client.query('COMMIT');
    return res.json({ updated_at: now });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Sync push error:', e);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

/* ── Static files ── */
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'KarriesKitchen.html'));
});

/* ── Start ── */
const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Karrie's Kitchen running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    // Still start the server so the app works without DB (localStorage only)
    app.listen(PORT, () => {
      console.log(`Karrie's Kitchen running on port ${PORT} (no database)`);
    });
  });
