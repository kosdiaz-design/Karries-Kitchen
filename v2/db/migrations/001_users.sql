CREATE TABLE IF NOT EXISTS users (
  user_id   TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  role      TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  pin_hash  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
