CREATE TABLE IF NOT EXISTS grocery_lists (
  id                     SERIAL PRIMARY KEY,
  user_id                TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipe_ids             INTEGER[] NOT NULL DEFAULT '{}',
  items                  JSONB NOT NULL DEFAULT '[]'::jsonb,
  publix_aisle_ordered   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grocery_user ON grocery_lists (user_id, created_at DESC);
