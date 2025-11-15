/**
 * Match Data Handlers
 * API endpoints for match data, odds, and predictions
 */

import { successResponse, errorResponse } from '../utils/response.js';
import * as dataSync from '../services/dataSyncService.js';
import * as predictionService from '../services/predictionService.js';

/**
 * GET /api/matches/today
 * Get today's matches
 */
export async function handleGetTodaysMatches(request, env) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const matches = await env.DB.prepare(`
      SELECT
        m.*,
        l.name as league_name, l.country as league_country, l.logo as league_logo,
        ht.name as home_team_name, ht.logo as home_team_logo,
        at.name as away_team_name, at.logo as away_team_logo
      FROM matches m
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.match_date = ?
      ORDER BY m.timestamp ASC
    `).bind(today).all();

    return successResponse('Today\'s matches fetched successfully', {
      matches: matches.results || [],
      count: matches.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching today\'s matches:', error);
    return errorResponse('Failed to fetch matches', 500);
  }
}

/**
 * GET /api/matches/live
 * Get live matches
 */
export async function handleGetLiveMatches(request, env) {
  try {
    const matches = await env.DB.prepare(`
      SELECT
        m.*,
        l.name as league_name, l.country as league_country, l.logo as league_logo,
        ht.name as home_team_name, ht.logo as home_team_logo,
        at.name as away_team_name, at.logo as away_team_logo
      FROM matches m
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.status = 'LIVE' OR m.status = '1H' OR m.status = 'HT' OR m.status = '2H'
      ORDER BY m.timestamp ASC
    `).all();

    return successResponse('Live matches fetched successfully', {
      matches: matches.results || [],
      count: matches.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return errorResponse('Failed to fetch live matches', 500);
  }
}

/**
 * GET /api/matches/upcoming
 * Get upcoming matches (next 7 days)
 */
export async function handleGetUpcomingMatches(request, env) {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const matches = await env.DB.prepare(`
      SELECT
        m.*,
        l.name as league_name, l.country as league_country, l.logo as league_logo,
        ht.name as home_team_name, ht.logo as home_team_logo,
        at.name as away_team_name, at.logo as away_team_logo
      FROM matches m
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.match_date BETWEEN ? AND ?
        AND m.status = 'NS'
      ORDER BY m.timestamp ASC
      LIMIT 50
    `).bind(todayStr, nextWeekStr).all();

    return successResponse('Upcoming matches fetched successfully', {
      matches: matches.results || [],
      count: matches.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return errorResponse('Failed to fetch upcoming matches', 500);
  }
}

/**
 * GET /api/matches/:id
 * Get match by ID with full details
 */
export async function handleGetMatchById(request, env, matchId) {
  try {
    const match = await env.DB.prepare(`
      SELECT
        m.*,
        l.name as league_name, l.country as league_country, l.logo as league_logo,
        ht.name as home_team_name, ht.logo as home_team_logo,
        at.name as away_team_name, at.logo as away_team_logo
      FROM matches m
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.id = ?
    `).bind(matchId).first();

    if (!match) {
      return errorResponse('Match not found', 404);
    }

    // Get statistics
    const stats = await env.DB.prepare(`
      SELECT ms.*, t.name as team_name
      FROM match_stats ms
      JOIN teams t ON ms.team_id = t.id
      WHERE ms.match_id = ?
    `).bind(matchId).all();

    // Get events
    const events = await env.DB.prepare(`
      SELECT me.*, t.name as team_name
      FROM match_events me
      JOIN teams t ON me.team_id = t.id
      WHERE me.match_id = ?
      ORDER BY me.time_elapsed ASC
    `).bind(matchId).all();

    // Get odds
    const odds = await env.DB.prepare(`
      SELECT * FROM odds
      WHERE match_id = ?
      ORDER BY bookmaker, market_type
    `).bind(matchId).all();

    // Get AI prediction
    const prediction = await env.DB.prepare(`
      SELECT * FROM ai_predictions
      WHERE match_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(matchId).first();

    return successResponse('Match details fetched successfully', {
      match,
      statistics: stats.results || [],
      events: events.results || [],
      odds: odds.results || [],
      prediction
    });
  } catch (error) {
    console.error('Error fetching match details:', error);
    return errorResponse('Failed to fetch match details', 500);
  }
}

/**
 * GET /api/predictions/today
 * Get AI predictions for today's matches (or recent if none today)
 */
export async function handleGetTodaysPredictions(request, env) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    // Try today first
    let predictions = await env.DB.prepare(`
      SELECT
        p.*,
        m.match_date, m.match_time, m.status,
        m.home_score, m.away_score, m.elapsed as elapsed_time,
        l.name as league_name, l.logo as league_logo,
        ht.name as home_team_name, ht.logo as home_team_logo,
        at.name as away_team_name, at.logo as away_team_logo
      FROM ai_predictions p
      JOIN matches m ON p.match_id = m.id
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.match_date = ?
      ORDER BY
        CASE m.status
          WHEN 'LIVE' THEN 1
          WHEN '1H' THEN 2
          WHEN 'HT' THEN 3
          WHEN '2H' THEN 4
          WHEN 'NS' THEN 5
          ELSE 6
        END,
        p.confidence DESC,
        p.value_rating DESC
    `).bind(today).all();

    // If no predictions for today, try yesterday
    if (!predictions.results || predictions.results.length === 0) {
      predictions = await env.DB.prepare(`
        SELECT
          p.*,
          m.match_date, m.match_time, m.status,
          m.home_score, m.away_score, m.elapsed as elapsed_time,
          l.name as league_name, l.logo as league_logo,
          ht.name as home_team_name, ht.logo as home_team_logo,
          at.name as away_team_name, at.logo as away_team_logo
        FROM ai_predictions p
        JOIN matches m ON p.match_id = m.id
        JOIN leagues l ON m.league_id = l.id
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        WHERE m.match_date >= ?
        ORDER BY m.match_date DESC,
          CASE m.status
            WHEN 'LIVE' THEN 1
            WHEN '1H' THEN 2
            WHEN 'HT' THEN 3
            WHEN '2H' THEN 4
            WHEN 'NS' THEN 5
            ELSE 6
          END,
          p.confidence DESC
        LIMIT 50
      `).bind(twoDaysAgo).all();
    }

    // Add is_live flag and prediction status for frontend
    const enrichedPredictions = (predictions.results || []).map(pred => {
      const isLive = ['LIVE', '1H', 'HT', '2H'].includes(pred.status);
      const isFinished = ['FT', 'AET', 'PEN'].includes(pred.status);

      let predictionResult = null;
      if (isFinished && pred.home_score !== null && pred.away_score !== null) {
        const actualWinner = pred.home_score > pred.away_score ? 'home' :
                            pred.away_score > pred.home_score ? 'away' : 'draw';
        predictionResult = actualWinner === pred.predicted_winner ? 'correct' : 'incorrect';
      }

      return {
        ...pred,
        is_live: isLive,
        is_finished: isFinished,
        prediction_result: predictionResult
      };
    });

    return successResponse('Today\'s predictions fetched successfully', {
      predictions: enrichedPredictions,
      count: enrichedPredictions.length
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return errorResponse(`Failed to fetch predictions: ${error.message}`, 500);
  }
}

/**
 * GET /api/value-bets
 * Get value bets (high confidence + good odds)
 */
export async function handleGetValueBets(request, env) {
  try {
    const valueBets = await env.DB.prepare(`
      SELECT
        vb.*,
        m.match_date, m.match_time,
        l.name as league_name,
        ht.name as home_team_name,
        at.name as away_team_name
      FROM value_bets vb
      JOIN matches m ON vb.match_id = m.id
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE vb.status = 'pending'
        AND m.status = 'NS'
        AND vb.value_percentage >= 5.0
      ORDER BY vb.value_percentage DESC, vb.confidence DESC
      LIMIT 20
    `).all();

    return successResponse('Value bets fetched successfully', {
      valueBets: valueBets.results || [],
      count: valueBets.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching value bets:', error);
    return errorResponse('Failed to fetch value bets', 500);
  }
}

/**
 * POST /api/sync/today
 * Sync today's matches from API-Football (Admin only)
 */
export async function handleSyncTodaysMatches(request, env, user) {
  if (user.role !== 'admin') {
    return errorResponse('Unauthorized', 403);
  }

  try {
    const result = await dataSync.syncTodaysFixtures(env);

    return successResponse('Synced today\'s matches successfully', result);
  } catch (error) {
    console.error('Error syncing today\'s matches:', error);
    return errorResponse(`Failed to sync matches: ${error.message}`, 500);
  }
}

/**
 * POST /api/sync/live
 * Update live matches from API-Football (Admin only)
 */
export async function handleSyncLiveMatches(request, env, user) {
  if (user.role !== 'admin') {
    return errorResponse('Unauthorized', 403);
  }

  try {
    const result = await dataSync.syncLiveFixtures(env);

    return successResponse('Synced live matches successfully', result);
  } catch (error) {
    console.error('Error syncing live matches:', error);
    return errorResponse(`Failed to sync live matches: ${error.message}`, 500);
  }
}

/**
 * POST /api/sync/leagues
 * Sync major leagues (Admin only)
 */
export async function handleSyncLeagues(request, env, user) {
  if (user.role !== 'admin') {
    return errorResponse('Unauthorized', 403);
  }

  try {
    const result = await dataSync.syncMajorLeagues(env);

    return successResponse('Synced leagues successfully', result);
  } catch (error) {
    console.error('Error syncing leagues:', error);
    return errorResponse(`Failed to sync leagues: ${error.message}`, 500);
  }
}

/**
 * GET /api/leagues
 * Get all leagues
 */
export async function handleGetLeagues(request, env) {
  try {
    const leagues = await env.DB.prepare(`
      SELECT * FROM leagues
      ORDER BY country, name
    `).all();

    return successResponse('Leagues fetched successfully', {
      leagues: leagues.results || [],
      count: leagues.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return errorResponse('Failed to fetch leagues', 500);
  }
}

/**
 * POST /api/admin/generate-predictions
 * Generate AI predictions for upcoming matches (Admin only)
 * Body: { leagueIds: [1, 2, 3], limit: 10 }
 */
export async function handleGeneratePredictions(request, env, user) {
  if (user.role !== 'admin') {
    return errorResponse('Unauthorized', 403);
  }

  try {
    // Parse request body for parameters
    let params = {};
    try {
      const body = await request.json();
      params = body || {};
    } catch (e) {
      // No body or invalid JSON, use defaults
    }

    const result = await predictionService.generatePredictionsForUpcoming(env, params);

    return successResponse('Generated predictions successfully', result);
  } catch (error) {
    console.error('Error generating predictions:', error);
    return errorResponse(`Failed to generate predictions: ${error.message}`, 500);
  }
}

/**
 * DELETE /api/admin/delete-predictions
 * Delete all AI predictions (Admin only)
 */
export async function handleDeletePredictions(env, user) {
  if (user.role !== 'admin') {
    return errorResponse('Unauthorized', 403);
  }

  try {
    // Delete all predictions
    const result = await env.DB.prepare('DELETE FROM ai_predictions').run();

    return successResponse('All predictions deleted successfully', {
      deleted: result.meta.changes || 0
    });
  } catch (error) {
    console.error('Error deleting predictions:', error);
    return errorResponse(`Failed to delete predictions: ${error.message}`, 500);
  }
}
