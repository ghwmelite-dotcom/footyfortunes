-- Migration 007: Phase 1 - Matches, Teams, Leagues, Odds & AI Predictions
-- Creates tables for real match data from API-Football

-- =====================================================
-- LEAGUES
-- =====================================================
CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY,
  api_league_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo TEXT,
  flag TEXT,
  season INTEGER NOT NULL,
  type TEXT DEFAULT 'league', -- league, cup
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_leagues_country ON leagues(country);
CREATE INDEX idx_leagues_season ON leagues(season);

-- =====================================================
-- TEAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_team_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  code TEXT, -- 3-letter code (e.g., ARS, MCI)
  country TEXT,
  founded INTEGER,
  logo TEXT,
  venue_name TEXT,
  venue_capacity INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_country ON teams(country);

-- =====================================================
-- MATCHES
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_fixture_id INTEGER UNIQUE NOT NULL,
  league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  round TEXT,

  -- Match Info
  match_date TEXT NOT NULL,
  match_time TEXT,
  timezone TEXT DEFAULT 'UTC',
  timestamp INTEGER NOT NULL,

  -- Teams
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,

  -- Status
  status TEXT NOT NULL, -- NS (Not Started), LIVE, HT, FT, PST, CANC, ABD, etc.
  status_long TEXT,
  elapsed INTEGER, -- Minutes played

  -- Score
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  home_halftime_score INTEGER,
  away_halftime_score INTEGER,
  home_fulltime_score INTEGER,
  away_fulltime_score INTEGER,

  -- Venue
  venue_name TEXT,
  venue_city TEXT,

  -- Referee
  referee TEXT,

  -- Metadata
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (league_id) REFERENCES leagues(id),
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id)
);

CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_timestamp ON matches(timestamp);

-- =====================================================
-- MATCH STATISTICS
-- =====================================================
CREATE TABLE IF NOT EXISTS match_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,

  -- Possession & Shots
  possession INTEGER, -- Percentage
  shots_on_goal INTEGER,
  shots_off_goal INTEGER,
  total_shots INTEGER,
  blocked_shots INTEGER,
  shots_inside_box INTEGER,
  shots_outside_box INTEGER,

  -- Passes & Attacks
  total_passes INTEGER,
  accurate_passes INTEGER,
  pass_accuracy INTEGER, -- Percentage
  attacks INTEGER,
  dangerous_attacks INTEGER,

  -- Fouls & Cards
  fouls INTEGER,
  corners INTEGER,
  offsides INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,

  -- Goalkeeper
  goalkeeper_saves INTEGER,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_match_stats_match ON match_stats(match_id);

-- =====================================================
-- MATCH EVENTS (Goals, Cards, Substitutions)
-- =====================================================
CREATE TABLE IF NOT EXISTS match_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,

  -- Event Info
  time_elapsed INTEGER NOT NULL,
  time_extra INTEGER,
  type TEXT NOT NULL, -- Goal, Card, Subst, Var
  detail TEXT, -- Normal Goal, Own Goal, Penalty, Yellow Card, Red Card, etc.

  -- Players
  player_name TEXT,
  player_id INTEGER,
  assist_name TEXT,
  assist_id INTEGER,

  comments TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_match_events_type ON match_events(type);

-- =====================================================
-- ODDS (Pre-match & Live)
-- =====================================================
CREATE TABLE IF NOT EXISTS odds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  bookmaker TEXT NOT NULL, -- Bet365, 1xBet, etc.
  bookmaker_id INTEGER,

  -- Market Type
  market_type TEXT NOT NULL, -- Match Winner, Both Teams Score, Over/Under, etc.
  market_id INTEGER,

  -- Values
  value_name TEXT NOT NULL, -- Home, Draw, Away, Yes, No, Over 2.5, etc.
  odd REAL NOT NULL,

  -- Timing
  is_live INTEGER DEFAULT 0, -- 0=pre-match, 1=live

  -- Metadata
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE INDEX idx_odds_match ON odds(match_id);
CREATE INDEX idx_odds_bookmaker ON odds(bookmaker);
CREATE INDEX idx_odds_market ON odds(market_type);
CREATE INDEX idx_odds_live ON odds(is_live);

-- =====================================================
-- AI PREDICTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,

  -- Prediction Type
  prediction_type TEXT NOT NULL, -- match_winner, btts, over_under, correct_score

  -- Predictions
  predicted_winner TEXT, -- home, draw, away
  home_win_probability REAL,
  draw_probability REAL,
  away_win_probability REAL,

  -- Goals
  predicted_home_goals REAL,
  predicted_away_goals REAL,
  over_under_25 TEXT, -- over, under
  over_25_probability REAL,
  btts TEXT, -- yes, no
  btts_probability REAL,

  -- Confidence & Risk
  confidence INTEGER, -- 0-100
  risk_level TEXT, -- low, medium, high

  -- Value Bet
  is_value_bet INTEGER DEFAULT 0,
  value_rating REAL, -- Expected value percentage

  -- Model Info
  model_name TEXT DEFAULT 'ensemble_v1',
  model_version TEXT,

  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE INDEX idx_predictions_match ON ai_predictions(match_id);
CREATE INDEX idx_predictions_confidence ON ai_predictions(confidence);
CREATE INDEX idx_predictions_value ON ai_predictions(is_value_bet);

-- =====================================================
-- AI MODELS (Track different prediction models)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  description TEXT,

  -- Performance Metrics
  accuracy REAL, -- Overall accuracy percentage
  roi REAL, -- Return on investment
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,

  -- Status
  is_active INTEGER DEFAULT 1,

  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default model
INSERT OR IGNORE INTO ai_models (name, version, description, is_active)
VALUES ('ensemble_v1', '1.0.0', 'Ensemble model combining form, head-to-head, and odds analysis', 1);

-- =====================================================
-- VALUE BETS (High-confidence predictions with value)
-- =====================================================
CREATE TABLE IF NOT EXISTS value_bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  prediction_id INTEGER NOT NULL,

  -- Bet Details
  bet_type TEXT NOT NULL, -- match_winner, btts, over_under
  selection TEXT NOT NULL, -- home, away, yes, over_2.5, etc.

  -- Odds
  best_odds REAL NOT NULL,
  bookmaker TEXT NOT NULL,
  predicted_probability REAL NOT NULL,

  -- Value
  expected_value REAL NOT NULL, -- (odds * probability) - 1
  value_percentage REAL NOT NULL,

  -- Risk
  confidence INTEGER NOT NULL,
  risk_level TEXT NOT NULL,

  -- Stake Recommendation
  recommended_stake_percentage REAL, -- Kelly Criterion percentage

  -- Status
  status TEXT DEFAULT 'pending', -- pending, won, lost, void
  actual_result TEXT,

  -- Metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,

  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (prediction_id) REFERENCES ai_predictions(id)
);

CREATE INDEX idx_value_bets_match ON value_bets(match_id);
CREATE INDEX idx_value_bets_status ON value_bets(status);
CREATE INDEX idx_value_bets_value ON value_bets(value_percentage);

-- =====================================================
-- API SYNC LOG (Track API fetches and rate limits)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL, -- fixtures, odds, leagues, teams, etc.
  request_params TEXT, -- JSON string of parameters

  -- Status
  status TEXT NOT NULL, -- success, error, rate_limited
  http_status INTEGER,
  records_fetched INTEGER DEFAULT 0,

  -- Error Info
  error_message TEXT,

  -- Rate Limiting
  requests_remaining INTEGER,
  rate_limit_reset TEXT,

  -- Timing
  response_time_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sync_log_endpoint ON api_sync_log(endpoint);
CREATE INDEX idx_sync_log_status ON api_sync_log(status);
CREATE INDEX idx_sync_log_date ON api_sync_log(created_at);

-- =====================================================
-- TEAM FORM (Recent performance tracker)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_form (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,

  -- Last 5 matches
  last_5_results TEXT, -- W-W-D-L-W format
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,

  -- Goals
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,

  -- Home/Away splits
  home_wins INTEGER DEFAULT 0,
  home_draws INTEGER DEFAULT 0,
  home_losses INTEGER DEFAULT 0,
  away_wins INTEGER DEFAULT 0,
  away_draws INTEGER DEFAULT 0,
  away_losses INTEGER DEFAULT 0,

  -- Averages
  avg_goals_scored REAL,
  avg_goals_conceded REAL,
  avg_possession REAL,

  -- Streaks
  current_streak TEXT, -- W3 (3 wins), L2 (2 losses), etc.

  -- Updated
  last_match_date TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (league_id) REFERENCES leagues(id)
);

CREATE INDEX idx_team_form_team ON team_form(team_id);
CREATE INDEX idx_team_form_league ON team_form(league_id);

-- =====================================================
-- HEAD TO HEAD HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS head_to_head (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_1_id INTEGER NOT NULL,
  team_2_id INTEGER NOT NULL,

  -- Stats
  total_matches INTEGER DEFAULT 0,
  team_1_wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  team_2_wins INTEGER DEFAULT 0,

  -- Goals
  team_1_goals INTEGER DEFAULT 0,
  team_2_goals INTEGER DEFAULT 0,

  -- Recent matches (last 5)
  last_5_results TEXT, -- JSON array of recent matches

  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (team_1_id) REFERENCES teams(id),
  FOREIGN KEY (team_2_id) REFERENCES teams(id)
);

CREATE INDEX idx_h2h_teams ON head_to_head(team_1_id, team_2_id);
