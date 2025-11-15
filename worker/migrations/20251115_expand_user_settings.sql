-- Migration: Expand user_settings table with comprehensive preferences
-- Created: 2025-11-15

-- Add missing columns to user_settings table
ALTER TABLE user_settings ADD COLUMN match_updates INTEGER DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN prediction_alerts INTEGER DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN achievement_alerts INTEGER DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN marketing_emails INTEGER DEFAULT 0;
ALTER TABLE user_settings ADD COLUMN theme TEXT DEFAULT 'dark';
ALTER TABLE user_settings ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE user_settings ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE user_settings ADD COLUMN currency TEXT DEFAULT 'GHS';
ALTER TABLE user_settings ADD COLUMN default_stake REAL DEFAULT 100;
ALTER TABLE user_settings ADD COLUMN risk_tolerance TEXT DEFAULT 'medium';
ALTER TABLE user_settings ADD COLUMN favorite_leagues TEXT DEFAULT '[]';
ALTER TABLE user_settings ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
