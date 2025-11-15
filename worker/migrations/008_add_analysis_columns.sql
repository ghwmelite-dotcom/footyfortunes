-- Add analysis and best_bet columns to ai_predictions table

ALTER TABLE ai_predictions ADD COLUMN analysis TEXT;
ALTER TABLE ai_predictions ADD COLUMN best_bet TEXT DEFAULT 'No recommendation';
