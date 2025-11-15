/**
 * AI Prediction Service
 * Generates predictions for upcoming football matches
 */

/**
 * Generate predictions for a match
 * @param {object} match - Match data with teams and league info
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Prediction data
 */
export async function generatePrediction(match, env) {
  try {
    // Only predict for upcoming matches (NS status)
    if (match.status !== 'NS') {
      return null;
    }

    // Get team form and H2H data
    const homeForm = await getTeamForm(match.home_team_id, match.league_id, env.DB);
    const awayForm = await getTeamForm(match.away_team_id, match.league_id, env.DB);
    const h2h = await getHeadToHead(match.home_team_id, match.away_team_id, env.DB);

    // Calculate probabilities using ensemble method
    const probabilities = calculateProbabilities(homeForm, awayForm, h2h);

    // Get odds for comparison (if available)
    const odds = await env.DB.prepare(`
      SELECT * FROM odds
      WHERE match_id = ? AND market_type = 'Match Winner'
      LIMIT 3
    `).bind(match.id).all();

    // Calculate value and confidence
    const { confidence, risk, isValueBet, valueRating } = calculateConfidence(probabilities, odds.results);

    // Generate additional predictions
    const overUnder = calculateOverUnder(homeForm, awayForm);
    const btts = calculateBTTS(homeForm, awayForm);

    // Determine predicted winner
    const maxProb = Math.max(probabilities.home, probabilities.draw, probabilities.away);
    let predictedWinner = 'draw';
    if (probabilities.home === maxProb) predictedWinner = 'home';
    else if (probabilities.away === maxProb) predictedWinner = 'away';

    // Calculate expected goals
    const expectedGoals = {
      home: (homeForm.avgGoalsScored + awayForm.avgGoalsConceded) / 2,
      away: (awayForm.avgGoalsScored + homeForm.avgGoalsConceded) / 2
    };

    // Generate AI-powered detailed analysis
    const analysis = await generateAnalysis(match, homeForm, awayForm, h2h, probabilities, expectedGoals, overUnder, btts, env);

    // Generate AI-powered best bet recommendation
    const bestBet = await generateBestBet(probabilities, overUnder, btts, expectedGoals, match, env);

    return {
      match_id: match.id,
      predicted_winner: predictedWinner,
      home_win_probability: probabilities.home,
      draw_probability: probabilities.draw,
      away_win_probability: probabilities.away,
      predicted_home_goals: expectedGoals.home.toFixed(1),
      predicted_away_goals: expectedGoals.away.toFixed(1),
      over_under_25: overUnder.prediction,
      over_25_probability: overUnder.probability,
      btts: btts.prediction,
      btts_probability: btts.probability,
      confidence,
      risk_level: risk,
      is_value_bet: isValueBet ? 1 : 0,
      value_rating: valueRating,
      model_name: 'ensemble_v1',
      model_version: '1.0.0',
      analysis: analysis,
      best_bet: bestBet
    };
  } catch (error) {
    console.error(`Error generating prediction for match ${match.id}:`, error);
    return null;
  }
}

/**
 * Get team form data
 */
async function getTeamForm(teamId, leagueId, db) {
  // Try to get existing form data
  let form = await db.prepare(`
    SELECT * FROM team_form
    WHERE team_id = ? AND league_id = ?
  `).bind(teamId, leagueId).first();

  // If no form data, calculate from recent matches
  if (!form) {
    form = await calculateTeamForm(teamId, leagueId, db);
  }

  return form || {
    wins: 0,
    draws: 0,
    losses: 0,
    goals_scored: 0,
    goals_conceded: 0,
    avgGoalsScored: 1.5,
    avgGoalsConceded: 1.5,
    home_wins: 0,
    away_wins: 0
  };
}

/**
 * Calculate team form from recent matches
 */
async function calculateTeamForm(teamId, leagueId, db) {
  const recentMatches = await db.prepare(`
    SELECT *
    FROM matches
    WHERE (home_team_id = ? OR away_team_id = ?)
      AND league_id = ?
      AND status = 'FT'
    ORDER BY match_date DESC
    LIMIT 10
  `).bind(teamId, teamId, leagueId).all();

  let wins = 0, draws = 0, losses = 0;
  let goalsScored = 0, goalsConceded = 0;
  let homeWins = 0, awayWins = 0;

  for (const match of recentMatches.results || []) {
    const isHome = match.home_team_id === teamId;
    const scored = isHome ? match.home_score : match.away_score;
    const conceded = isHome ? match.away_score : match.home_score;

    goalsScored += scored || 0;
    goalsConceded += conceded || 0;

    if (scored > conceded) {
      wins++;
      if (isHome) homeWins++;
      else awayWins++;
    } else if (scored === conceded) {
      draws++;
    } else {
      losses++;
    }
  }

  const matchCount = recentMatches.results?.length || 1;

  return {
    wins,
    draws,
    losses,
    goals_scored: goalsScored,
    goals_conceded: goalsConceded,
    avgGoalsScored: goalsScored / matchCount,
    avgGoalsConceded: goalsConceded / matchCount,
    home_wins: homeWins,
    away_wins: awayWins
  };
}

/**
 * Get head-to-head data
 */
async function getHeadToHead(team1Id, team2Id, db) {
  const h2h = await db.prepare(`
    SELECT * FROM head_to_head
    WHERE (team_1_id = ? AND team_2_id = ?)
       OR (team_1_id = ? AND team_2_id = ?)
  `).bind(team1Id, team2Id, team2Id, team1Id).first();

  if (h2h) return h2h;

  // Calculate from recent matches
  const matches = await db.prepare(`
    SELECT *
    FROM matches
    WHERE ((home_team_id = ? AND away_team_id = ?)
        OR (home_team_id = ? AND away_team_id = ?))
      AND status = 'FT'
    ORDER BY match_date DESC
    LIMIT 5
  `).bind(team1Id, team2Id, team2Id, team1Id).all();

  let team1Wins = 0, team2Wins = 0, draws = 0;

  for (const match of matches.results || []) {
    if (match.home_score > match.away_score) {
      if (match.home_team_id === team1Id) team1Wins++;
      else team2Wins++;
    } else if (match.home_score < match.away_score) {
      if (match.away_team_id === team1Id) team1Wins++;
      else team2Wins++;
    } else {
      draws++;
    }
  }

  return {
    total_matches: matches.results?.length || 0,
    team_1_wins: team1Wins,
    team_2_wins: team2Wins,
    draws
  };
}

/**
 * Calculate match outcome probabilities
 */
function calculateProbabilities(homeForm, awayForm, h2h) {
  // Base probabilities (neutral)
  let homeProb = 0.33;
  let drawProb = 0.33;
  let awayProb = 0.33;

  // Adjust for form (40% weight)
  const homeFormScore = (homeForm.wins * 3 + homeForm.draws) / ((homeForm.wins + homeForm.draws + homeForm.losses) || 1);
  const awayFormScore = (awayForm.wins * 3 + awayForm.draws) / ((awayForm.wins + awayForm.draws + awayForm.losses) || 1);

  const formDiff = homeFormScore - awayFormScore;
  homeProb += formDiff * 0.04;
  awayProb -= formDiff * 0.04;

  // Home advantage (10% weight)
  homeProb += 0.10;
  awayProb -= 0.05;
  drawProb -= 0.05;

  // H2H influence (20% weight)
  if (h2h.total_matches >= 3) {
    const h2hHomeWinRate = h2h.team_1_wins / h2h.total_matches;
    const h2hAwayWinRate = h2h.team_2_wins / h2h.total_matches;

    homeProb += (h2hHomeWinRate - 0.33) * 0.2;
    awayProb += (h2hAwayWinRate - 0.33) * 0.2;
  }

  // Goals factor (20% weight)
  const homeAttack = homeForm.avgGoalsScored || 1.5;
  const awayAttack = awayForm.avgGoalsScored || 1.5;
  const homeDefense = homeForm.avgGoalsConceded || 1.5;
  const awayDefense = awayForm.avgGoalsConceded || 1.5;

  const homeStrength = homeAttack / awayDefense;
  const awayStrength = awayAttack / homeDefense;

  if (homeStrength > 1.3) homeProb += 0.1;
  if (awayStrength > 1.3) awayProb += 0.1;
  if (Math.abs(homeStrength - awayStrength) < 0.2) drawProb += 0.1;

  // Normalize to 100%
  const total = homeProb + drawProb + awayProb;
  homeProb = (homeProb / total) * 100;
  drawProb = (drawProb / total) * 100;
  awayProb = (awayProb / total) * 100;

  return {
    home: Math.round(homeProb * 10) / 10,
    draw: Math.round(drawProb * 10) / 10,
    away: Math.round(awayProb * 10) / 10
  };
}

/**
 * Calculate confidence and value
 */
function calculateConfidence(probabilities, odds) {
  // Base confidence on probability spread
  const maxProb = Math.max(probabilities.home, probabilities.draw, probabilities.away);
  const minProb = Math.min(probabilities.home, probabilities.draw, probabilities.away);
  const spread = maxProb - minProb;

  // Confidence: 60-95% based on how clear the prediction is
  let confidence = 60 + (spread * 0.7);
  confidence = Math.min(95, Math.max(60, Math.round(confidence)));

  // Risk level
  let risk = 'medium';
  if (confidence >= 80) risk = 'low';
  else if (confidence < 70) risk = 'high';

  // Value bet calculation (if odds available)
  let isValueBet = false;
  let valueRating = 0;

  if (odds && odds.length > 0) {
    // Find best odds for predicted outcome
    const predictedOutcome = maxProb === probabilities.home ? 'Home' :
                             maxProb === probabilities.away ? 'Away' : 'Draw';

    const bestOdd = odds.find(o => o.value_name === predictedOutcome);

    if (bestOdd) {
      const impliedProb = (1 / bestOdd.odd) * 100;
      const ourProb = maxProb;

      // Value = (odds * our_probability) - 1
      const expectedValue = (bestOdd.odd * (ourProb / 100)) - 1;
      valueRating = Math.round(expectedValue * 100 * 10) / 10;

      // Value bet if our probability is significantly higher than implied
      isValueBet = ourProb > impliedProb + 10 && expectedValue > 0.15;
    }
  }

  return { confidence, risk, isValueBet, valueRating };
}

/**
 * Calculate Over/Under 2.5 goals
 */
function calculateOverUnder(homeForm, awayForm) {
  const expectedGoals = (homeForm.avgGoalsScored + homeForm.avgGoalsConceded +
                        awayForm.avgGoalsScored + awayForm.avgGoalsConceded) / 2;

  const probability = expectedGoals > 2.5 ?
    Math.min(85, 50 + ((expectedGoals - 2.5) * 15)) :
    Math.max(15, 50 - ((2.5 - expectedGoals) * 15));

  return {
    prediction: expectedGoals > 2.5 ? 'over' : 'under',
    probability: Math.round(probability)
  };
}

/**
 * Calculate Both Teams to Score
 */
function calculateBTTS(homeForm, awayForm) {
  const homeScoring = homeForm.avgGoalsScored || 1.5;
  const awayScoring = awayForm.avgGoalsScored || 1.5;

  // If both teams average > 1 goal, likely BTTS
  const probability = Math.min(85, ((homeScoring + awayScoring) / 4) * 100);

  return {
    prediction: (homeScoring >= 1.0 && awayScoring >= 1.0) ? 'yes' : 'no',
    probability: Math.round(probability)
  };
}

/**
 * Generate predictions for all upcoming matches
 * @param {object} env - Environment bindings
 * @param {object} params - Parameters { leagueIds: [], limit: 10 }
 */
export async function generatePredictionsForUpcoming(env, params = {}) {
  try {
    const { leagueIds = [], limit = null } = params;

    // Build query with optional league filter and limit
    let query = `
      SELECT
        m.*,
        l.name as league_name,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM matches m
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.status = 'NS'
    `;

    // Add league filter if specified
    if (leagueIds && leagueIds.length > 0) {
      const placeholders = leagueIds.map(() => '?').join(',');
      query += ` AND m.league_id IN (${placeholders})`;
    }

    query += ` ORDER BY m.timestamp ASC`;

    // Add limit if specified
    if (limit && limit > 0) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    // Prepare and bind parameters
    const stmt = env.DB.prepare(query);
    const matches = leagueIds && leagueIds.length > 0
      ? await stmt.bind(...leagueIds).all()
      : await stmt.all();

    let generated = 0;
    let errors = 0;

    for (const match of matches.results || []) {
      try {
        const prediction = await generatePrediction(match, env);

        if (prediction) {
          // Save prediction to database
          await env.DB.prepare(`
            INSERT OR REPLACE INTO ai_predictions
            (match_id, predicted_winner, home_win_probability, draw_probability, away_win_probability,
             predicted_home_goals, predicted_away_goals, over_under_25, over_25_probability,
             btts, btts_probability, confidence, risk_level, is_value_bet, value_rating,
             model_name, model_version, prediction_type, analysis, best_bet)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'match_winner', ?, ?)
          `).bind(
            prediction.match_id,
            prediction.predicted_winner,
            prediction.home_win_probability,
            prediction.draw_probability,
            prediction.away_win_probability,
            prediction.predicted_home_goals,
            prediction.predicted_away_goals,
            prediction.over_under_25,
            prediction.over_25_probability,
            prediction.btts,
            prediction.btts_probability,
            prediction.confidence,
            prediction.risk_level,
            prediction.is_value_bet,
            prediction.value_rating,
            prediction.model_name,
            prediction.model_version,
            prediction.analysis || '',
            prediction.best_bet || 'No recommendation'
          ).run();

          generated++;

          // If it's a value bet, add to value_bets table
          if (prediction.is_value_bet) {
            await createValueBet(match, prediction, env.DB);
          }
        }
      } catch (error) {
        console.error(`Error generating prediction for match ${match.id}:`, error);
        errors++;
      }
    }

    return { generated, errors, total: matches.results?.length || 0 };
  } catch (error) {
    console.error('Error generating predictions:', error);
    throw error;
  }
}

/**
 * Create value bet entry
 */
async function createValueBet(match, prediction, db) {
  try {
    const selection = prediction.predicted_winner === 'home' ? match.home_team_name :
                     prediction.predicted_winner === 'away' ? match.away_team_name : 'Draw';

    const probability = prediction.predicted_winner === 'home' ? prediction.home_win_probability :
                       prediction.predicted_winner === 'away' ? prediction.away_win_probability :
                       prediction.draw_probability;

    await db.prepare(`
      INSERT OR IGNORE INTO value_bets
      (match_id, prediction_id, bet_type, selection, best_odds, bookmaker,
       predicted_probability, expected_value, value_percentage, confidence, risk_level, status)
      VALUES (?, ?, 'match_winner', ?, 2.0, 'Average', ?, 0.20, ?, ?, ?, 'pending')
    `).bind(
      match.id,
      match.id, // prediction_id (will be updated after insert)
      selection,
      probability,
      prediction.value_rating,
      prediction.confidence,
      prediction.risk_level
    ).run();
  } catch (error) {
    console.error('Error creating value bet:', error);
  }
}

/**
 * Generate AI-powered detailed match analysis
 */
async function generateAnalysis(match, homeForm, awayForm, h2h, probabilities, expectedGoals, overUnder, btts, env) {
  try {
    const homeFormPct = ((homeForm.wins * 3 + homeForm.draws) / ((homeForm.wins + homeForm.draws + homeForm.losses) * 3) * 100) || 0;
    const awayFormPct = ((awayForm.wins * 3 + awayForm.draws) / ((awayForm.wins + awayForm.draws + awayForm.losses) * 3) * 100) || 0;
    const totalExpectedGoals = expectedGoals.home + expectedGoals.away;

    const prompt = `Analyze this football match in 2-3 sentences as a professional sports analyst:

${match.home_team_name} vs ${match.away_team_name}

Home Team Stats:
- Recent form: ${homeForm.wins}W-${homeForm.draws}D-${homeForm.losses}L (${homeFormPct.toFixed(0)}% points)
- Avg goals scored: ${homeForm.avgGoalsScored.toFixed(1)} per match
- Avg goals conceded: ${homeForm.avgGoalsConceded.toFixed(1)} per match

Away Team Stats:
- Recent form: ${awayForm.wins}W-${awayForm.draws}D-${awayForm.losses}L (${awayFormPct.toFixed(0)}% points)
- Avg goals scored: ${awayForm.avgGoalsScored.toFixed(1)} per match
- Avg goals conceded: ${awayForm.avgGoalsConceded.toFixed(1)} per match

${h2h.total_matches >= 3 ? `Head-to-Head (${h2h.total_matches} matches): ${match.home_team_name} ${h2h.team_1_wins}W, Draw ${h2h.draws}, ${match.away_team_name} ${h2h.team_2_wins}W` : 'Limited H2H history'}

Predicted probabilities: Home ${probabilities.home}%, Draw ${probabilities.draw}%, Away ${probabilities.away}%
Expected goals: ${expectedGoals.home.toFixed(1)} - ${expectedGoals.away.toFixed(1)} (Total: ${totalExpectedGoals.toFixed(1)})

Provide a concise, professional analysis focusing on form, key strengths/weaknesses, and what to expect. Be specific and data-driven.`;

    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 256,
      temperature: 0.7
    });

    return aiResponse.response || 'Analysis unavailable';
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to basic template
    return `${match.home_team_name} (${homeForm.wins}W-${homeForm.draws}D-${homeForm.losses}L) hosts ${match.away_team_name} (${awayForm.wins}W-${awayForm.draws}D-${awayForm.losses}L). Expected goals: ${expectedGoals.home.toFixed(1)} - ${expectedGoals.away.toFixed(1)}. ${probabilities.home > 50 ? 'Home team favored' : probabilities.away > 50 ? 'Away team favored' : 'Evenly matched contest'}.`;
  }
}

/**
 * Generate AI-powered best bet recommendation
 */
async function generateBestBet(probabilities, overUnder, btts, expectedGoals, match, env) {
  try {
    const totalExpected = parseFloat(expectedGoals.home) + parseFloat(expectedGoals.away);
    const homeOrDraw = probabilities.home + probabilities.draw;
    const awayOrDraw = probabilities.away + probabilities.draw;
    const homeOrAway = probabilities.home + probabilities.away;

    const prompt = `As a professional sports betting analyst, recommend the SINGLE best bet for this match. Return ONLY the bet name, nothing else.

Match: ${match.home_team_name} vs ${match.away_team_name}

Available bet options and probabilities:
- Home Win: ${probabilities.home}%
- Draw: ${probabilities.draw}%
- Away Win: ${probabilities.away}%
- Home or Draw (Double Chance): ${homeOrDraw.toFixed(1)}%
- Away or Draw (Double Chance): ${awayOrDraw.toFixed(1)}%
- Home or Away - No Draw: ${homeOrAway.toFixed(1)}%
- Over 2.5 Goals: ${overUnder.prediction === 'over' ? overUnder.probability : 100 - overUnder.probability}%
- Under 2.5 Goals: ${overUnder.prediction === 'under' ? overUnder.probability : 100 - overUnder.probability}%
- Over 3.5 Goals: ${totalExpected > 3.5 ? Math.min(85, 50 + ((totalExpected - 3.5) * 20)).toFixed(1) : 20}%
- Under 1.5 Goals: ${totalExpected < 1.8 ? Math.min(85, 50 + ((1.8 - totalExpected) * 25)).toFixed(1) : 15}%
- Both Teams to Score: ${btts.prediction === 'yes' ? btts.probability : 100 - btts.probability}%

Expected goals: ${expectedGoals.home.toFixed(1)} - ${expectedGoals.away.toFixed(1)} (Total: ${totalExpected.toFixed(1)})

Choose the bet with the best combination of high probability and value. Return ONLY the exact bet name from the list above.`;

    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 32,
      temperature: 0.3
    });

    // Clean up AI response - extract just the bet name
    let bet = (aiResponse.response || '').trim();
    bet = bet.replace(/[*"'\n]/g, '').trim();

    // Validate the response is a reasonable bet type
    const validBets = ['Home Win', 'Draw', 'Away Win', 'Home or Draw', 'Away or Draw', 'Home or Away',
                      'Over 2.5 Goals', 'Under 2.5 Goals', 'Over 3.5 Goals', 'Under 1.5 Goals',
                      'Both Teams to Score', 'No BTTS'];

    if (validBets.some(valid => bet.toLowerCase().includes(valid.toLowerCase()))) {
      return bet;
    }

    // Fallback: choose highest probability bet
    const maxProb = Math.max(probabilities.home, probabilities.draw, probabilities.away);
    if (probabilities.home === maxProb && probabilities.home > 45) return 'Home Win';
    if (probabilities.away === maxProb && probabilities.away > 45) return 'Away Win';
    if (homeOrDraw > 70) return 'Home or Draw';
    if (overUnder.probability > 65) return overUnder.prediction === 'over' ? 'Over 2.5 Goals' : 'Under 2.5 Goals';

    return 'No strong recommendation';
  } catch (error) {
    console.error('AI best bet failed:', error);
    // Fallback logic
    const maxProb = Math.max(probabilities.home, probabilities.draw, probabilities.away);
    if (probabilities.home === maxProb && probabilities.home > 45) return 'Home Win';
    if (probabilities.away === maxProb && probabilities.away > 45) return 'Away Win';
    if (probabilities.draw === maxProb && probabilities.draw > 35) return 'Draw';
    return 'No strong recommendation';
  }
}
