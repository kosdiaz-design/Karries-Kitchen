CREATE TABLE IF NOT EXISTS meal_plans (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  week_starting   DATE NOT NULL,
  days            JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_starting)
);
