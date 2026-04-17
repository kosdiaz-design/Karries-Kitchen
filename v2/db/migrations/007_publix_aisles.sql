CREATE TABLE IF NOT EXISTS publix_aisles (
  id          SERIAL PRIMARY KEY,
  store       TEXT NOT NULL DEFAULT 'gandy_commons',
  aisle_order INTEGER NOT NULL,
  name        TEXT NOT NULL,
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE (store, name)
);

CREATE INDEX IF NOT EXISTS idx_aisle_order ON publix_aisles (store, aisle_order);
