-- ============================================================================
-- FOOTYFORTUNES COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- Version: 2.0.0
-- Total Tables: 82
-- Database: Cloudflare D1 (SQLite)
-- ============================================================================

-- ============================================================================
-- CORE: USER MANAGEMENT (4 tables)
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

-- ============================================================================
-- CORE: MATCH MANAGEMENT (6 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  season TEXT,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  country TEXT,
  founded INTEGER,
  venue_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS venues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  capacity INTEGER,
  surface TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_id INTEGER UNIQUE,
  league_id INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  venue_id INTEGER,
  kick_off_time TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'live', 'finished', 'postponed', 'cancelled')),
  minute INTEGER,
  home_score INTEGER,
  away_score INTEGER,
  half_time_home INTEGER,
  half_time_away INTEGER,
  full_time_home INTEGER,
  full_time_away INTEGER,
  extra_time_home INTEGER,
  extra_time_away INTEGER,
  penalties_home INTEGER,
  penalties_away INTEGER,
  referee TEXT,
  weather TEXT,
  temperature REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS match_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  update_type TEXT NOT NULL CHECK(update_type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'var', 'penalty', 'injury', 'status_change')),
  minute INTEGER,
  team_id INTEGER,
  player_name TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS match_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  possession INTEGER,
  shots_total INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  shots_off_target INTEGER DEFAULT 0,
  shots_blocked INTEGER DEFAULT 0,
  corners INTEGER DEFAULT 0,
  offsides INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  passes_total INTEGER DEFAULT 0,
  passes_accurate INTEGER DEFAULT 0,
  expected_goals REAL,
  updated_at TEXT,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- ============================================================================
-- CORE: AI PREDICTIONS (8 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS prediction_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('result', 'goals', 'both_teams', 'handicap', 'corners', 'cards')),
  description TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ai_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  version TEXT,
  model_type TEXT CHECK(model_type IN ('llm', 'statistical', 'ensemble')),
  provider TEXT,
  description TEXT,
  weight REAL DEFAULT 1.0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  prediction_type_id INTEGER NOT NULL,
  prediction_value TEXT NOT NULL,
  confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 100),
  probability REAL CHECK(probability >= 0 AND probability <= 1),
  reasoning TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES ai_models(id),
  FOREIGN KEY (prediction_type_id) REFERENCES prediction_types(id)
);

CREATE TABLE IF NOT EXISTS ensemble_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  prediction_type_id INTEGER NOT NULL,
  final_prediction TEXT NOT NULL,
  confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 100),
  ai_weight REAL DEFAULT 0.5,
  statistical_weight REAL DEFAULT 0.3,
  elo_weight REAL DEFAULT 0.2,
  combined_reasoning TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_type_id) REFERENCES prediction_types(id)
);

CREATE TABLE IF NOT EXISTS user_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  prediction_type_id INTEGER NOT NULL,
  prediction_value TEXT NOT NULL,
  confidence REAL CHECK(confidence >= 0 AND confidence <= 100),
  stake REAL,
  odds REAL,
  potential_return REAL,
  result TEXT CHECK(result IN ('won', 'lost', 'void', 'pending')),
  is_public INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_type_id) REFERENCES prediction_types(id)
);

CREATE TABLE IF NOT EXISTS model_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INTEGER NOT NULL,
  prediction_type_id INTEGER NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy REAL,
  average_confidence REAL,
  roi REAL,
  profit_loss REAL,
  sharpe_ratio REAL,
  updated_at TEXT,
  FOREIGN KEY (model_id) REFERENCES ai_models(id),
  FOREIGN KEY (prediction_type_id) REFERENCES prediction_types(id)
);

-- Team Form & Statistics for AI
CREATE TABLE IF NOT EXISTS team_form (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  result TEXT CHECK(result IN ('W', 'D', 'L')),
  goals_scored INTEGER,
  goals_conceded INTEGER,
  xg_for REAL,
  xg_against REAL,
  points INTEGER,
  match_date TEXT,
  is_home INTEGER,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS head_to_head (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team1_id INTEGER NOT NULL,
  team2_id INTEGER NOT NULL,
  total_matches INTEGER DEFAULT 0,
  team1_wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  team2_wins INTEGER DEFAULT 0,
  team1_goals INTEGER DEFAULT 0,
  team2_goals INTEGER DEFAULT 0,
  last_updated TEXT,
  FOREIGN KEY (team1_id) REFERENCES teams(id),
  FOREIGN KEY (team2_id) REFERENCES teams(id)
);

-- ============================================================================
-- GAMIFICATION: XP, ACHIEVEMENTS, LEADERBOARDS (10 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_stats (
  user_id INTEGER PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  total_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  rank_global INTEGER,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievement_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('prediction_accuracy', 'streak', 'volume', 'profit', 'social', 'special')),
  description TEXT NOT NULL,
  badge_icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  is_unlocked INTEGER DEFAULT 0,
  unlocked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievement_definitions(id),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS leaderboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  leaderboard_type TEXT NOT NULL CHECK(leaderboard_type IN ('global', 'weekly', 'monthly', 'league_specific')),
  metric_type TEXT NOT NULL CHECK(metric_type IN ('xp', 'accuracy', 'roi', 'profit', 'streak')),
  metric_value REAL NOT NULL,
  rank INTEGER NOT NULL,
  period_start TEXT,
  period_end TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenge_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK(challenge_type IN ('daily', 'weekly', 'special')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenge_definitions(id),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT CHECK(tournament_type IN ('weekly', 'monthly', 'special')),
  entry_fee_coins INTEGER DEFAULT 0,
  prize_pool_coins INTEGER DEFAULT 0,
  max_participants INTEGER,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'finished')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tournament_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  prize_won INTEGER DEFAULT 0,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournament_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  prediction_value TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (entry_id) REFERENCES tournament_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- BANKROLL MANAGEMENT (9 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bankrolls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  initial_balance REAL NOT NULL,
  current_balance REAL NOT NULL,
  total_deposited REAL DEFAULT 0,
  total_withdrawn REAL DEFAULT 0,
  total_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmakers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active INTEGER DEFAULT 1,
  country_restrictions TEXT,
  bonus_info TEXT
);

CREATE TABLE IF NOT EXISTS bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_id INTEGER,
  bookmaker_id INTEGER,
  bet_type TEXT NOT NULL CHECK(bet_type IN ('single', 'accumulator', 'system')),
  prediction_type TEXT NOT NULL,
  selection TEXT NOT NULL,
  stake REAL NOT NULL,
  odds REAL NOT NULL,
  potential_return REAL NOT NULL,
  actual_return REAL DEFAULT 0,
  profit_loss REAL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost', 'void', 'cashed_out')),
  kelly_fraction REAL,
  notes TEXT,
  placed_at TEXT NOT NULL DEFAULT (datetime('now')),
  settled_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id)
);

CREATE TABLE IF NOT EXISTS bankroll_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bankroll_id INTEGER NOT NULL,
  balance REAL NOT NULL,
  change_amount REAL NOT NULL,
  change_type TEXT NOT NULL CHECK(change_type IN ('bet_placed', 'bet_won', 'bet_lost', 'deposit', 'withdrawal')),
  reference_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bankroll_id) REFERENCES bankrolls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL CHECK(alert_type IN ('daily', 'weekly', 'monthly')),
  limit_amount REAL NOT NULL,
  current_spent REAL DEFAULT 0,
  is_triggered INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS risk_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  period_type TEXT NOT NULL CHECK(period_type IN ('weekly', 'monthly', 'all_time')),
  total_bets INTEGER DEFAULT 0,
  winning_bets INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  average_odds REAL,
  total_staked REAL DEFAULT 0,
  total_returned REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  sharpe_ratio REAL,
  max_drawdown REAL,
  profit_factor REAL,
  variance REAL,
  period_start TEXT,
  period_end TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performance_breakdown (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  breakdown_type TEXT NOT NULL CHECK(breakdown_type IN ('bet_type', 'league', 'prediction_type', 'odds_range')),
  breakdown_value TEXT NOT NULL,
  total_bets INTEGER DEFAULT 0,
  winning_bets INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  total_staked REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kelly_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  true_probability REAL NOT NULL,
  bookmaker_odds REAL NOT NULL,
  full_kelly REAL,
  half_kelly REAL,
  quarter_kelly REAL,
  recommended_stake REAL,
  expected_value REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS bet_slip_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  selection TEXT NOT NULL,
  odds REAL NOT NULL,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

-- ============================================================================
-- VALUE BETS & ODDS COMPARISON (7 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS odds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  bookmaker_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  market_name TEXT NOT NULL,
  odds_value REAL NOT NULL,
  is_best INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id)
);

CREATE TABLE IF NOT EXISTS value_bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  selection TEXT NOT NULL,
  bookmaker_id INTEGER NOT NULL,
  bookmaker_odds REAL NOT NULL,
  true_probability REAL NOT NULL,
  expected_value REAL NOT NULL,
  value_percentage REAL NOT NULL,
  confidence_score REAL,
  recommended_stake REAL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id)
);

CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  bookmaker1_id INTEGER NOT NULL,
  bookmaker1_selection TEXT NOT NULL,
  bookmaker1_odds REAL NOT NULL,
  bookmaker1_stake REAL NOT NULL,
  bookmaker2_id INTEGER NOT NULL,
  bookmaker2_selection TEXT NOT NULL,
  bookmaker2_odds REAL NOT NULL,
  bookmaker2_stake REAL NOT NULL,
  total_stake REAL NOT NULL,
  guaranteed_profit REAL NOT NULL,
  profit_percentage REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (bookmaker1_id) REFERENCES bookmakers(id),
  FOREIGN KEY (bookmaker2_id) REFERENCES bookmakers(id)
);

CREATE TABLE IF NOT EXISTS odds_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  odds_id INTEGER NOT NULL,
  old_value REAL NOT NULL,
  new_value REAL NOT NULL,
  change_percentage REAL NOT NULL,
  movement_type TEXT CHECK(movement_type IN ('increase', 'decrease')),
  is_significant INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (odds_id) REFERENCES odds(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS closing_line_value (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bet_id INTEGER NOT NULL,
  taken_odds REAL NOT NULL,
  closing_odds REAL NOT NULL,
  clv_percentage REAL NOT NULL,
  clv_indicator TEXT CHECK(clv_indicator IN ('positive', 'negative', 'neutral')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bet_id) REFERENCES bets(id)
);

CREATE TABLE IF NOT EXISTS odds_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  target_odds REAL NOT NULL,
  current_odds REAL,
  is_triggered INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  triggered_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS best_odds_finder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  selection TEXT NOT NULL,
  best_bookmaker_id INTEGER NOT NULL,
  best_odds REAL NOT NULL,
  average_odds REAL,
  odds_advantage REAL,
  updated_at TEXT,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (best_bookmaker_id) REFERENCES bookmakers(id)
);

-- ============================================================================
-- SOCIAL TRADING (9 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tipster_profiles (
  user_id INTEGER PRIMARY KEY,
  display_name TEXT NOT NULL,
  bio TEXT,
  is_verified INTEGER DEFAULT 0,
  specialty_leagues TEXT,
  specialty_bet_types TEXT,
  tier TEXT DEFAULT 'bronze' CHECK(tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_tips INTEGER DEFAULT 0,
  winning_tips INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  average_odds REAL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_profit REAL DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS followers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  tipster_id INTEGER NOT NULL,
  auto_copy INTEGER DEFAULT 0,
  notifications_enabled INTEGER DEFAULT 1,
  followed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tipster_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(follower_id, tipster_id)
);

CREATE TABLE IF NOT EXISTS premium_tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipster_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL,
  price_coins INTEGER NOT NULL,
  monthly_subscription_price INTEGER,
  description TEXT,
  confidence REAL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  FOREIGN KEY (tipster_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS tip_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  premium_tip_id INTEGER NOT NULL,
  price_paid INTEGER NOT NULL,
  purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (premium_tip_id) REFERENCES premium_tips(id),
  UNIQUE(user_id, premium_tip_id)
);

CREATE TABLE IF NOT EXISTS tipster_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tipster_id INTEGER NOT NULL,
  price_paid INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  auto_renew INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tipster_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prediction_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prediction_id INTEGER NOT NULL,
  is_public INTEGER DEFAULT 1,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES user_predictions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prediction_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  feed_item_id INTEGER NOT NULL,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('upvote', 'downvote')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (feed_item_id) REFERENCES prediction_feed(id) ON DELETE CASCADE,
  UNIQUE(user_id, feed_item_id)
);

CREATE TABLE IF NOT EXISTS prediction_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  feed_item_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (feed_item_id) REFERENCES prediction_feed(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tipster_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tipster_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tipster_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, tipster_id)
);

-- ============================================================================
-- ANALYTICS DASHBOARD (8 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  total_staked REAL DEFAULT 0,
  total_returned REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  average_odds REAL,
  average_confidence REAL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS analytics_league (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  total_staked REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (league_id) REFERENCES leagues(id),
  UNIQUE(user_id, league_id)
);

CREATE TABLE IF NOT EXISTS analytics_bettype (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  bet_type TEXT NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy REAL DEFAULT 0,
  total_staked REAL DEFAULT 0,
  net_profit REAL DEFAULT 0,
  roi REAL DEFAULT 0,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, bet_type)
);

CREATE TABLE IF NOT EXISTS performance_trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  period_type TEXT NOT NULL CHECK(period_type IN ('7_day', '30_day', '90_day', '1_year')),
  metric_type TEXT NOT NULL CHECK(metric_type IN ('accuracy', 'roi', 'profit', 'volume')),
  data_points TEXT NOT NULL,
  trend_direction TEXT CHECK(trend_direction IN ('up', 'down', 'stable')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS heatmap_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  heatmap_type TEXT NOT NULL CHECK(heatmap_type IN ('league_accuracy', 'bettype_roi', 'time_performance')),
  x_axis TEXT NOT NULL,
  y_axis TEXT NOT NULL,
  value REAL NOT NULL,
  color_intensity INTEGER,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comparative_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  metric_type TEXT NOT NULL,
  user_value REAL NOT NULL,
  global_average REAL,
  top10_average REAL,
  percentile REAL,
  global_rank INTEGER,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS confidence_calibration (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  confidence_range TEXT NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  actual_accuracy REAL,
  expected_accuracy REAL,
  calibration_error REAL,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report_exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  report_type TEXT NOT NULL CHECK(report_type IN ('performance', 'bankroll', 'analytics')),
  format TEXT NOT NULL CHECK(format IN ('pdf', 'excel', 'csv')),
  date_from TEXT,
  date_to TEXT,
  filters TEXT,
  file_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- AI ASSISTANT & PERSONALIZATION (7 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  favorite_leagues TEXT,
  favorite_teams TEXT,
  preferred_bet_types TEXT,
  min_odds REAL DEFAULT 1.5,
  max_odds REAL DEFAULT 5.0,
  min_confidence REAL DEFAULT 70,
  risk_tolerance TEXT DEFAULT 'moderate' CHECK(risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  auto_follow_ai INTEGER DEFAULT 1,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id INTEGER PRIMARY KEY,
  high_value_bets INTEGER DEFAULT 1,
  favorite_team_alerts INTEGER DEFAULT 1,
  tipster_updates INTEGER DEFAULT 1,
  achievement_unlocks INTEGER DEFAULT 1,
  price_alerts INTEGER DEFAULT 1,
  match_start_reminders INTEGER DEFAULT 0,
  result_notifications INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_learning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prediction_id INTEGER NOT NULL,
  interaction_type TEXT NOT NULL CHECK(interaction_type IN ('followed', 'ignored', 'modified')),
  original_confidence REAL,
  user_confidence REAL,
  outcome TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES ai_predictions(id)
);

CREATE TABLE IF NOT EXISTS user_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prediction_id INTEGER NOT NULL,
  feedback_type TEXT NOT NULL CHECK(feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'excellent')),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES ai_predictions(id)
);

CREATE TABLE IF NOT EXISTS model_weights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  form_weight REAL DEFAULT 0.25,
  h2h_weight REAL DEFAULT 0.20,
  venue_weight REAL DEFAULT 0.15,
  odds_weight REAL DEFAULT 0.20,
  ai_weight REAL DEFAULT 0.20,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK(notification_type IN ('value_bet', 'favorite_team', 'tipster', 'achievement', 'price_alert', 'match_start', 'result')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('urgent', 'high', 'medium', 'low')),
  action_url TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contextual_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  insight_type TEXT NOT NULL CHECK(insight_type IN ('weather', 'injuries', 'referee', 'motivation', 'form', 'news')),
  description TEXT NOT NULL,
  impact TEXT CHECK(impact IN ('positive', 'negative', 'neutral')),
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- ============================================================================
-- LIVE FEATURES (6 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS live_matches (
  match_id INTEGER PRIMARY KEY,
  is_live INTEGER DEFAULT 1,
  live_minute INTEGER,
  last_update TEXT,
  viewer_count INTEGER DEFAULT 0,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS live_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  prediction_type TEXT NOT NULL CHECK(prediction_type IN ('next_goal', 'final_result', 'over_under', 'total_goals')),
  prediction_value TEXT NOT NULL,
  confidence REAL NOT NULL,
  odds REAL,
  reasoning TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS momentum_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  home_momentum REAL NOT NULL CHECK(home_momentum >= 0 AND home_momentum <= 100),
  away_momentum REAL NOT NULL CHECK(away_momentum >= 0 AND away_momentum <= 100),
  direction TEXT NOT NULL CHECK(direction IN ('home', 'away', 'neutral')),
  strength REAL NOT NULL,
  trend TEXT CHECK(trend IN ('increasing', 'stable', 'decreasing')),
  factors TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cash_out_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bet_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  current_value REAL NOT NULL,
  profit_loss REAL NOT NULL,
  recommendation TEXT CHECK(recommendation IN ('hold', 'cash_out', 'hedge')),
  confidence REAL,
  reasoning TEXT,
  calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bet_id) REFERENCES bets(id),
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS stream_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  url TEXT NOT NULL,
  quality TEXT CHECK(quality IN ('4K', 'HD', 'SD')),
  language TEXT,
  is_legal INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  subscription_required INTEGER DEFAULT 0,
  subscription_info TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS live_stats_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  stats_snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- ============================================================================
-- COMMUNITY FEATURES (4 tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK(room_type IN ('general', 'match_specific', 'league_specific')),
  match_id INTEGER,
  league_id INTEGER,
  participant_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (league_id) REFERENCES leagues(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  reaction_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS booking_codes (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  total_matches INTEGER NOT NULL,
  combined_odds REAL NOT NULL,
  total_stake REAL,
  potential_return REAL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'won', 'lost', 'expired')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- LEGACY TABLES (for backwards compatibility)
-- ============================================================================

CREATE TABLE IF NOT EXISTS picks (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  combined_odds REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'won', 'lost')),
  created_at TEXT NOT NULL,
  updated_at TEXT,
  ai_generated INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  preferences TEXT NOT NULL,
  subscribed_at TEXT NOT NULL,
  unsubscribed_at TEXT
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pick_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  FOREIGN KEY (pick_id) REFERENCES picks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User & Auth Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);

-- Match & League Indexes
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_kick_off_time ON matches(kick_off_time);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
CREATE INDEX IF NOT EXISTS idx_match_stats_match_id ON match_stats(match_id);

-- Prediction Indexes
CREATE INDEX IF NOT EXISTS idx_ai_predictions_match_id ON ai_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id ON user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_match_id ON user_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_ensemble_predictions_match_id ON ensemble_predictions(match_id);

-- Gamification Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_rank ON leaderboards(leaderboard_type, rank);
CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament_id ON tournament_entries(tournament_id);

-- Bankroll Indexes
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_bankroll_id ON bankroll_history(bankroll_id);

-- Odds Indexes
CREATE INDEX IF NOT EXISTS idx_odds_match_id ON odds(match_id);
CREATE INDEX IF NOT EXISTS idx_odds_bookmaker_id ON odds(bookmaker_id);
CREATE INDEX IF NOT EXISTS idx_value_bets_match_id ON value_bets(match_id);
CREATE INDEX IF NOT EXISTS idx_arbitrage_match_id ON arbitrage_opportunities(match_id);

-- Social Indexes
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_tipster_id ON followers(tipster_id);
CREATE INDEX IF NOT EXISTS idx_prediction_feed_user_id ON prediction_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_tips_tipster_id ON premium_tips(tipster_id);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_daily_user_date ON analytics_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_analytics_league_user ON analytics_league(user_id, league_id);

-- Live Features Indexes
CREATE INDEX IF NOT EXISTS idx_live_predictions_match_id ON live_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_momentum_data_match_id ON momentum_data(match_id);

-- Community Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_match_id ON chat_rooms(match_id);

-- Legacy Indexes
CREATE INDEX IF NOT EXISTS idx_picks_date ON picks(date);
CREATE INDEX IF NOT EXISTS idx_picks_status ON picks(status);
CREATE INDEX IF NOT EXISTS idx_comments_pick_id ON comments(pick_id);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Total Tables: 82
-- Total Indexes: 40+
-- ============================================================================
