CREATE TABLE IF NOT EXISTS recipe_edit_history (
  id                 SERIAL PRIMARY KEY,
  recipe_id          INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  edited_by          TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  previous_snapshot  JSONB NOT NULL,
  note               TEXT,
  edited_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edit_history_recipe ON recipe_edit_history (recipe_id, edited_at DESC);
