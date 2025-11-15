-- Migration: Add user favorites table for saved predictions
-- Created: 2025-11-15

CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prediction_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES ai_predictions(id) ON DELETE CASCADE,
  UNIQUE(user_id, prediction_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prediction ON user_favorites(prediction_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created ON user_favorites(created_at);
