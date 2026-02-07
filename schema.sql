-- Users table for persistent balances
CREATE TABLE IF NOT EXISTS users (
  address TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 1000,
  ens_name TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Leaderboard table for persistent rankings
CREATE TABLE IF NOT EXISTS leaderboard (
  address TEXT PRIMARY KEY,
  ens_name TEXT,
  profit INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0
);
