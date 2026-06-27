-- AI Академия — схема на D1 базата данни за абонати на бюлетина.
-- Double opt-in: status 'pending' -> 'active' (след потвърждение) -> 'unsubscribed'.

CREATE TABLE IF NOT EXISTS subscribers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | active | unsubscribed
  token         TEXT NOT NULL,                   -- за потвърждение/отписване
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at  TEXT,
  unsubscribed_at TEXT,
  source        TEXT DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (token);

-- Лог на изпратените броеве (по желание, за статистика).
CREATE TABLE IF NOT EXISTS sent_issues (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_slug  TEXT NOT NULL,
  subject     TEXT NOT NULL,
  recipients  INTEGER NOT NULL DEFAULT 0,
  sent_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
