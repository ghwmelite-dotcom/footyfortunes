-- Phase 2: User Picks Tracking & Gamification System
-- Migration 009: User picks, betting history, achievements, and leaderboard support

-- ============================================================================
-- USER PICKS & BETTING HISTORY
-- ============================================================================

-- Table: user_picks
-- Tracks which predictions users select and their betting amounts
CREATE TABLE IF NOT EXISTS user_picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prediction_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  stake_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  potential_return DECIMAL(10, 2) DEFAULT 0.00,
  actual_return DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost', 'void', 'cancelled')),
  placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  settled_at DATETIME,
  confidence_at_time INTEGER,
  predicted_outcome TEXT,
  actual_outcome TEXT,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES ai_predictions(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_picks_user ON user_picks(user_id);
CREATE INDEX idx_user_picks_prediction ON user_picks(prediction_id);
CREATE INDEX idx_user_picks_match ON user_picks(match_id);
CREATE INDEX idx_user_picks_status ON user_picks(status);
CREATE INDEX idx_user_picks_placed_at ON user_picks(placed_at);

-- ============================================================================
-- GAMIFICATION SYSTEM
-- ============================================================================

-- Table: achievements
-- Defines all available achievements users can unlock
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK(category IN ('picks', 'winning', 'streaks', 'social', 'special', 'milestones')),
  icon TEXT,
  rarity TEXT CHECK(rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 0,
  unlock_condition TEXT,
  threshold_value INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_achievements
-- Tracks which achievements each user has unlocked
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);

-- Table: user_levels
-- Tracks user level progression and XP
CREATE TABLE IF NOT EXISTS user_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 100,
  level_up_count INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_levels_user ON user_levels(user_id);
CREATE INDEX idx_user_levels_level ON user_levels(current_level);

-- Table: xp_transactions
-- Log all XP gains/losses for transparency
CREATE TABLE IF NOT EXISTS xp_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at);

-- ============================================================================
-- USER STATISTICS (Enhanced)
-- ============================================================================

-- Table: user_betting_stats
-- Comprehensive betting statistics per user
CREATE TABLE IF NOT EXISTS user_betting_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  
  -- Pick counts
  total_picks INTEGER DEFAULT 0,
  pending_picks INTEGER DEFAULT 0,
  settled_picks INTEGER DEFAULT 0,
  won_picks INTEGER DEFAULT 0,
  lost_picks INTEGER DEFAULT 0,
  void_picks INTEGER DEFAULT 0,
  
  -- Win rate & accuracy
  win_rate DECIMAL(5, 2) DEFAULT 0.00,
  accuracy_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Financial stats
  total_staked DECIMAL(12, 2) DEFAULT 0.00,
  total_returned DECIMAL(12, 2) DEFAULT 0.00,
  net_profit DECIMAL(12, 2) DEFAULT 0.00,
  roi_percentage DECIMAL(6, 2) DEFAULT 0.00,
  
  -- Streaks
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  current_loss_streak INTEGER DEFAULT 0,
  longest_loss_streak INTEGER DEFAULT 0,
  
  -- Bankroll
  starting_bankroll DECIMAL(12, 2) DEFAULT 1000.00,
  current_bankroll DECIMAL(12, 2) DEFAULT 1000.00,
  peak_bankroll DECIMAL(12, 2) DEFAULT 1000.00,
  
  -- Averages
  avg_stake DECIMAL(10, 2) DEFAULT 0.00,
  avg_odds DECIMAL(5, 2) DEFAULT 0.00,
  avg_confidence DECIMAL(5, 2) DEFAULT 0.00,
  
  -- By confidence ranges
  high_confidence_picks INTEGER DEFAULT 0,
  high_confidence_wins INTEGER DEFAULT 0,
  medium_confidence_picks INTEGER DEFAULT 0,
  medium_confidence_wins INTEGER DEFAULT 0,
  low_confidence_picks INTEGER DEFAULT 0,
  low_confidence_wins INTEGER DEFAULT 0,
  
  -- Time-based
  picks_today INTEGER DEFAULT 0,
  picks_this_week INTEGER DEFAULT 0,
  picks_this_month INTEGER DEFAULT 0,
  
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_betting_stats_user ON user_betting_stats(user_id);
CREATE INDEX idx_user_betting_stats_roi ON user_betting_stats(roi_percentage);
CREATE INDEX idx_user_betting_stats_winrate ON user_betting_stats(win_rate);

-- ============================================================================
-- LEADERBOARD SUPPORT
-- ============================================================================

-- Table: leaderboard_entries
-- Snapshot-based leaderboard for different time periods
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  period_type TEXT CHECK(period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  rank INTEGER,
  total_picks INTEGER DEFAULT 0,
  won_picks INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0.00,
  roi_percentage DECIMAL(6, 2) DEFAULT 0.00,
  net_profit DECIMAL(12, 2) DEFAULT 0.00,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, period_type, period_start)
);

CREATE INDEX idx_leaderboard_period ON leaderboard_entries(period_type, period_start);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id);

-- ============================================================================
-- BANKROLL MANAGEMENT
-- ============================================================================

-- Table: bankroll_history
-- Track bankroll changes over time
CREATE TABLE IF NOT EXISTS bankroll_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  previous_balance DECIMAL(12, 2) NOT NULL,
  new_balance DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) NOT NULL,
  change_type TEXT CHECK(change_type IN ('bet_placed', 'bet_won', 'bet_lost', 'deposit', 'withdrawal', 'adjustment')),
  related_pick_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_pick_id) REFERENCES user_picks(id) ON DELETE SET NULL
);

CREATE INDEX idx_bankroll_history_user ON bankroll_history(user_id);
CREATE INDEX idx_bankroll_history_created ON bankroll_history(created_at);

-- ============================================================================
-- SEED ACHIEVEMENTS DATA
-- ============================================================================

INSERT OR IGNORE INTO achievements (code, name, description, category, icon, rarity, xp_reward, unlock_condition, threshold_value) VALUES
-- Picks milestones
('first_pick', 'First Pick', 'Place your first bet', 'picks', '🎯', 'common', 10, 'total_picks', 1),
('pick_veteran', 'Pick Veteran', 'Place 50 bets', 'picks', '📈', 'rare', 50, 'total_picks', 50),
('pick_master', 'Pick Master', 'Place 100 bets', 'picks', '🏆', 'epic', 100, 'total_picks', 100),
('pick_legend', 'Pick Legend', 'Place 500 bets', 'picks', '👑', 'legendary', 500, 'total_picks', 500),

-- Winning milestones
('first_win', 'First Win', 'Win your first bet', 'winning', '✨', 'common', 20, 'won_picks', 1),
('hot_streak', 'Hot Streak', 'Win 5 bets in a row', 'streaks', '🔥', 'rare', 100, 'current_win_streak', 5),
('unstoppable', 'Unstoppable', 'Win 10 bets in a row', 'streaks', '💪', 'epic', 250, 'current_win_streak', 10),
('legendary_streak', 'Legendary Streak', 'Win 20 bets in a row', 'streaks', '⚡', 'legendary', 1000, 'current_win_streak', 20),

-- Accuracy
('sharp_eye', 'Sharp Eye', 'Achieve 70% win rate with 20+ bets', 'winning', '👁️', 'rare', 150, 'win_rate_threshold', 70),
('master_predictor', 'Master Predictor', 'Achieve 80% win rate with 50+ bets', 'winning', '🎓', 'epic', 300, 'win_rate_threshold', 80),
('oracle', 'Oracle', 'Achieve 90% win rate with 100+ bets', 'winning', '🔮', 'legendary', 1000, 'win_rate_threshold', 90),

-- Profit
('profit_maker', 'Profit Maker', 'Earn GH₵1000 net profit', 'winning', '💰', 'rare', 100, 'net_profit', 1000),
('high_roller', 'High Roller', 'Earn GH₵5000 net profit', 'winning', '💎', 'epic', 500, 'net_profit', 5000),
('whale', 'Whale', 'Earn GH₵10000 net profit', 'winning', '🐋', 'legendary', 1000, 'net_profit', 10000),

-- ROI
('value_hunter', 'Value Hunter', 'Achieve 20% ROI with 50+ bets', 'winning', '🎯', 'rare', 150, 'roi_threshold', 20),
('roi_king', 'ROI King', 'Achieve 50% ROI with 100+ bets', 'winning', '👑', 'legendary', 1000, 'roi_threshold', 50),

-- Special
('early_adopter', 'Early Adopter', 'Join FootyFortunes', 'special', '🌟', 'common', 50, 'account_age', 0),
('daily_grinder', 'Daily Grinder', 'Place bets for 7 consecutive days', 'special', '📅', 'rare', 200, 'daily_streak', 7),
('confidence_expert', 'Confidence Expert', 'Win 10 high-confidence picks', 'winning', '🎖️', 'epic', 250, 'high_confidence_wins', 10),
('underdog_champion', 'Underdog Champion', 'Win 5 low-confidence picks', 'winning', '🦸', 'rare', 150, 'low_confidence_wins', 5);

-- ============================================================================
-- INITIALIZE USER STATS FOR EXISTING USERS
-- ============================================================================

-- Create betting stats for all existing users
INSERT OR IGNORE INTO user_betting_stats (user_id, starting_bankroll, current_bankroll, peak_bankroll)
SELECT id, 1000.00, 1000.00, 1000.00 FROM users;

-- Create level records for all existing users
INSERT OR IGNORE INTO user_levels (user_id, current_level, current_xp, total_xp, next_level_xp)
SELECT id, 1, 0, 0, 100 FROM users;

-- Grant "Early Adopter" achievement to all existing users
INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, is_completed, progress)
SELECT u.id, a.id, 1, 1
FROM users u
CROSS JOIN achievements a
WHERE a.code = 'early_adopter';

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC STATS UPDATES
-- ============================================================================

-- Trigger: Update stats when a pick is placed
CREATE TRIGGER IF NOT EXISTS after_user_pick_insert
AFTER INSERT ON user_picks
BEGIN
  UPDATE user_betting_stats
  SET total_picks = total_picks + 1,
      pending_picks = pending_picks + 1,
      total_staked = total_staked + NEW.stake_amount,
      current_bankroll = current_bankroll - NEW.stake_amount,
      picks_today = picks_today + 1,
      picks_this_week = picks_this_week + 1,
      picks_this_month = picks_this_month + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
  
  -- Log bankroll change
  INSERT INTO bankroll_history (user_id, previous_balance, new_balance, change_amount, change_type, related_pick_id)
  SELECT 
    NEW.user_id,
    current_bankroll + NEW.stake_amount,
    current_bankroll,
    -NEW.stake_amount,
    'bet_placed',
    NEW.id
  FROM user_betting_stats
  WHERE user_id = NEW.user_id;
END;

-- Trigger: Update stats when a pick is settled (won/lost)
CREATE TRIGGER IF NOT EXISTS after_user_pick_settled
AFTER UPDATE ON user_picks
WHEN OLD.status = 'pending' AND NEW.status IN ('won', 'lost')
BEGIN
  UPDATE user_betting_stats
  SET 
    pending_picks = pending_picks - 1,
    settled_picks = settled_picks + 1,
    won_picks = won_picks + CASE WHEN NEW.status = 'won' THEN 1 ELSE 0 END,
    lost_picks = lost_picks + CASE WHEN NEW.status = 'lost' THEN 1 ELSE 0 END,
    total_returned = total_returned + NEW.actual_return,
    net_profit = net_profit + (NEW.actual_return - NEW.stake_amount),
    current_bankroll = current_bankroll + NEW.actual_return,
    peak_bankroll = MAX(peak_bankroll, current_bankroll + NEW.actual_return),
    current_win_streak = CASE 
      WHEN NEW.status = 'won' THEN current_win_streak + 1
      ELSE 0
    END,
    longest_win_streak = MAX(longest_win_streak, 
      CASE WHEN NEW.status = 'won' THEN current_win_streak + 1 ELSE current_win_streak END
    ),
    current_loss_streak = CASE 
      WHEN NEW.status = 'lost' THEN current_loss_streak + 1
      ELSE 0
    END,
    longest_loss_streak = MAX(longest_loss_streak,
      CASE WHEN NEW.status = 'lost' THEN current_loss_streak + 1 ELSE current_loss_streak END
    ),
    win_rate = CASE 
      WHEN settled_picks + 1 > 0 
      THEN (CAST(won_picks + CASE WHEN NEW.status = 'won' THEN 1 ELSE 0 END AS FLOAT) / (settled_picks + 1)) * 100
      ELSE 0
    END,
    roi_percentage = CASE
      WHEN total_staked > 0
      THEN ((total_returned + NEW.actual_return - total_staked) / total_staked) * 100
      ELSE 0
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
  
  -- Log bankroll change
  INSERT INTO bankroll_history (user_id, previous_balance, new_balance, change_amount, change_type, related_pick_id)
  SELECT 
    NEW.user_id,
    current_bankroll,
    current_bankroll + NEW.actual_return,
    NEW.actual_return,
    CASE WHEN NEW.status = 'won' THEN 'bet_won' ELSE 'bet_lost' END,
    NEW.id
  FROM user_betting_stats
  WHERE user_id = NEW.user_id;
END;

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: User complete profile with stats
CREATE VIEW IF NOT EXISTS v_user_profiles AS
SELECT 
  u.id,
  u.email,
  u.username,
  u.full_name,
  u.role,
  ul.current_level,
  ul.current_xp,
  ul.total_xp,
  ubs.total_picks,
  ubs.won_picks,
  ubs.lost_picks,
  ubs.win_rate,
  ubs.roi_percentage,
  ubs.net_profit,
  ubs.current_bankroll,
  ubs.current_win_streak,
  ubs.longest_win_streak,
  (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id AND is_completed = 1) as achievements_count
FROM users u
LEFT JOIN user_levels ul ON u.id = ul.user_id
LEFT JOIN user_betting_stats ubs ON u.id = ubs.user_id;

-- View: Leaderboard (all-time)
CREATE VIEW IF NOT EXISTS v_leaderboard_all_time AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY ubs.net_profit DESC, ubs.roi_percentage DESC) as rank,
  u.id,
  u.username,
  u.full_name,
  ul.current_level,
  ubs.total_picks,
  ubs.won_picks,
  ubs.win_rate,
  ubs.roi_percentage,
  ubs.net_profit,
  ubs.current_win_streak,
  ubs.longest_win_streak
FROM users u
JOIN user_betting_stats ubs ON u.id = ubs.user_id
JOIN user_levels ul ON u.id = ul.user_id
WHERE ubs.total_picks >= 10
ORDER BY ubs.net_profit DESC, ubs.roi_percentage DESC;

