-- Insert Today's AI Picks for Testing
-- This migration creates sample picks for today with realistic football matches

-- Clear any existing picks for today
DELETE FROM matches WHERE pick_id IN (
  SELECT id FROM picks WHERE date = DATE('now')
);
DELETE FROM picks WHERE date = DATE('now');

-- Insert today's pick
INSERT INTO picks (id, date, combined_odds, status, created_at, ai_generated)
VALUES (
  'pick_' || strftime('%Y%m%d', 'now') || '_001',
  DATE('now'),
  4.23,
  'pending',
  DATETIME('now'),
  1
);

-- Insert matches for today's pick
INSERT INTO matches (
  pick_id,
  league,
  home_team,
  away_team,
  kick_off_time,
  selection_type,
  odds,
  confidence,
  fixture_id,
  reasoning
) VALUES
-- Match 1: Premier League
(
  'pick_' || strftime('%Y%m%d', 'now') || '_001',
  'Premier League',
  'Arsenal',
  'Manchester United',
  'Today 17:30',
  'Home Win',
  1.72,
  87,
  854321,
  'Arsenal''s home form is exceptional with 8 wins in last 10 games. United have won only 2 of their last 6 away matches. Arsenal averaging 2.3 goals per home game vs United''s 1.1 away goals conceded.'
),
-- Match 2: La Liga
(
  'pick_' || strftime('%Y%m%d', 'now') || '_001',
  'La Liga',
  'Barcelona',
  'Atletico Madrid',
  'Today 20:00',
  'Over 2.5 Goals',
  1.85,
  82,
  854322,
  'Barcelona''s matches average 3.2 total goals this season. Atletico Madrid have seen Over 2.5 in 7 of last 9 away games. Historical El Clasico fixture produces high-scoring encounters.'
),
-- Match 3: Bundesliga
(
  'pick_' || strftime('%Y%m%d', 'now') || '_001',
  'Bundesliga',
  'Bayern Munich',
  'Borussia Dortmund',
  'Today 18:30',
  'BTTS',
  1.55,
  91,
  854323,
  'Both teams have elite attacking capabilities. Bayern scored in all 15 home games, Dortmund scored in all 14 away games. Der Klassiker has seen BTTS in 9 of last 10 meetings. Defensive vulnerabilities on both sides.'
);

-- Verify insertion
SELECT
  p.id,
  p.date,
  p.combined_odds,
  p.status,
  COUNT(m.id) as match_count
FROM picks p
LEFT JOIN matches m ON p.id = m.pick_id
WHERE p.date = DATE('now')
GROUP BY p.id;
