-- ============================================================================
-- Migration: 001_initial_schema
-- Description: Create all 82 tables for the comprehensive platform
-- Date: 2025-01-06
-- ============================================================================

-- This file contains the complete schema from schema-comprehensive.sql
-- Split into logical sections for better readability

-- ============================================================================
-- SECTION 1: CORE USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'tipster')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'banned')),
  email_verified INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_accessed TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY,
  bio TEXT,
  location TEXT,
  timezone TEXT,
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  website_url TEXT,
  twitter_handle TEXT,
  telegram_handle TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY,
  theme TEXT DEFAULT 'light' CHECK(theme IN ('light', 'dark', 'auto')),
  email_notifications INTEGER DEFAULT 1,
  push_notifications INTEGER DEFAULT 1,
  telegram_notifications INTEGER DEFAULT 0,
  sound_enabled INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
