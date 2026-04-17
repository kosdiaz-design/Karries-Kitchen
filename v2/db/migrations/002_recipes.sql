CREATE TABLE IF NOT EXISTS recipes (
  id                SERIAL PRIMARY KEY,
  title             TEXT NOT NULL,
  source_type       TEXT NOT NULL CHECK (source_type IN (
    'manual', 'hellofresh', 'pdf', 'youtube', 'instagram', 'facebook', 'web'
  )),
  source_url        TEXT,
  source_image_url  TEXT,

  ingredients       JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps             JSONB NOT NULL DEFAULT '[]'::jsonb,
  equipment         TEXT[] NOT NULL DEFAULT '{}',

  servings_base     INTEGER,
  calories          INTEGER,
  macros            JSONB,

  main_protein      TEXT,
  main_ingredient   TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',

  esv_blessing_text TEXT,
  esv_reference     TEXT,

  rating            SMALLINT CHECK (rating BETWEEN 1 AND 5),
  is_favorite       BOOLEAN NOT NULL DEFAULT FALSE,
  is_eric_approved  BOOLEAN NOT NULL DEFAULT FALSE,

  times_made        INTEGER NOT NULL DEFAULT 0,
  last_cooked_at    TIMESTAMPTZ,

  created_by        TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  approved          BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by       TEXT REFERENCES users(user_id) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON recipes USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_recipes_main_protein ON recipes (main_protein);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_recipes_last_cooked ON recipes (last_cooked_at);
