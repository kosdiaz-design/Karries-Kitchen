CREATE TABLE IF NOT EXISTS pending_imports (
  id             SERIAL PRIMARY KEY,
  submitted_by   TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  source_type    TEXT NOT NULL CHECK (source_type IN (
    'instagram', 'facebook', 'web', 'youtube', 'pdf', 'hellofresh'
  )),
  source_url     TEXT,
  raw_payload    JSONB,
  extracted      JSONB,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by    TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_imports (status, created_at);
