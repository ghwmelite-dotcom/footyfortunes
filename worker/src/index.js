/**
 * FootyFortunes Worker API - Secure Version
 * With bcrypt, JWT, validation, rate limiting, and proper security
 */

import { getCorsHeaders, corsPreflightResponse, errorResponse, successResponse } from './utils/response.js';
import { requireAuth, requireAdmin, optionalAuth } from './middleware/authMiddleware.js';
import { checkRateLimit, addRateLimitHeaders } from './utils/rateLimit.js';
import {
  handleLogin,
  handleRegister,
  handleRefreshToken,
  handleLogout,
  handleGetMe
} from './handlers/authHandlers.js';
import {
  handleGetTodaysPicks as handleGetTodaysPicksNew,
  handleGeneratePicks,
  handleGetArchive as handleGetArchiveNew
} from './handlers/picksHandlers.js';
import {
  handleGetTodaysMatches,
  handleGetLiveMatches,
  handleGetUpcomingMatches,
  handleGetMatchById,
  handleGetTodaysPredictions,
  handleGetValueBets,
  handleSyncTodaysMatches,
  handleSyncLiveMatches,
  handleSyncLeagues,
  handleGetLeagues,
  handleGeneratePredictions,
  handleDeletePredictions
} from './handlers/matchHandlers.js';
import {
  handlePlacePick,
  handleGetUserPicks,
  handleGetUserStats,
  handleGetLeaderboard,
  handleGetUserAchievements,
  handleGetBankrollHistory,
  handleSettlePicks
} from './handlers/userPicksHandlers.js';
import {
  handleUpdateProfile,
  handleUpdateSettings,
  handleGetSettings,
  handleChangePassword
} from './handlers/userHandlers.js';
import {
  handleAddFavorite,
  handleRemoveFavorite,
  handleGetFavorites,
  handleCheckFavorite
} from './handlers/favoritesHandlers.js';

// ============================================================================
// AI PICK GENERATION (unchanged from original)
// ============================================================================

async function generateAIPicks(env) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const existing = await env.DB.prepare(
      'SELECT id FROM picks WHERE date = ?'
    ).bind(today).first();

    if (existing) {
      return { success: true, message: 'Picks already exist for today', pickId: existing.id };
    }

    const fixtures = [
      { league: 'Premier League', home: 'Arsenal', away: 'Chelsea', time: '20:00', fixtureId: 12345 },
      { league: 'La Liga', home: 'Barcelona', away: 'Real Madrid', time: '21:00', fixtureId: 12346 },
      { league: 'Bundesliga', home: 'Bayern', away: 'Dortmund', time: '18:30', fixtureId: 12347 }
    ];

    const aiPrompt = `Analyze these football matches and suggest betting picks with odds around 1.5-2.0 each:
${fixtures.map(f => `${f.home} vs ${f.away} (${f.league})`).join('\n')}

Provide predictions in this format:
Match: [Home] vs [Away]
Selection: [Home Win/Draw/Away Win/Over 2.5/BTTS/etc]
Odds: [1.5-2.0]
Confidence: [70-95%]
Reasoning: [brief analysis]`;

    let aiAnalysis;
    try {
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        prompt: aiPrompt
      });
      aiAnalysis = aiResponse.response;
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      aiAnalysis = 'Using default selections';
    }

    const matches = [
      {
        league: 'Premier League',
        home: 'Arsenal',
        away: 'Chelsea',
        time: '20:00',
        selection: 'Home Win',
        odds: 1.65,
        confidence: 85,
        fixtureId: 12345,
        reasoning: 'Strong home form, Chelsea struggles away'
      },
      {
        league: 'La Liga',
        home: 'Barcelona',
        away: 'Real Madrid',
        time: '21:00',
        selection: 'Over 2.5',
        odds: 1.75,
        confidence: 78,
        fixtureId: 12346,
        reasoning: 'Both teams score frequently in El Clasico'
      },
      {
        league: 'Bundesliga',
        home: 'Bayern',
        away: 'Dortmund',
        time: '18:30',
        selection: 'BTTS',
        odds: 1.55,
        confidence: 82,
        fixtureId: 12347,
        reasoning: 'Top attacking teams, defensive issues'
      }
    ];

    const combinedOdds = matches.reduce((acc, m) => acc * m.odds, 1).toFixed(2);
    const pickId = `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await env.DB.prepare(
      'INSERT INTO picks (id, date, combined_odds, status, created_at, ai_generated) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(pickId, today, combinedOdds, 'pending', new Date().toISOString(), 1).run();

    for (const match of matches) {
      await env.DB.prepare(
        `INSERT INTO matches (pick_id, league, home_team, away_team, kick_off_time,
          selection_type, odds, confidence, fixture_id, reasoning)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        pickId, match.league, match.home, match.away, match.time,
        match.selection, match.odds, match.confidence, match.fixtureId, match.reasoning
      ).run();
    }

    return { success: true, pickId, aiAnalysis };
  } catch (error) {
    console.error('AI pick generation error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// PICK HANDLERS
// ============================================================================

async function handleGetTodaysPicks(env, corsHeaders) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const pick = await env.DB.prepare(
      'SELECT * FROM picks WHERE date = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(today).first();

    if (!pick) {
      return successResponse({
        picks: null,
        message: 'No picks available for today'
      }, null, corsHeaders);
    }

    const matches = await env.DB.prepare(
      'SELECT * FROM matches WHERE pick_id = ?'
    ).bind(pick.id).all();

    return successResponse({
      picks: { ...pick, matches: matches.results }
    }, null, corsHeaders);
  } catch (error) {
    console.error('Get picks error:', error);
    return errorResponse('Failed to fetch picks', 500, null, corsHeaders);
  }
}

async function handleGetArchive(url, env, corsHeaders) {
  try {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    const picks = await env.DB.prepare(
      'SELECT * FROM picks WHERE status IN (?, ?) ORDER BY date DESC LIMIT ? OFFSET ?'
    ).bind('won', 'lost', limit, offset).all();

    const stats = await env.DB.prepare(`
      SELECT
        COUNT(*) as totalPicks,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
      FROM picks WHERE status IN ('won', 'lost')
    `).first();

    const winRate = stats.totalPicks > 0
      ? ((stats.won / stats.totalPicks) * 100).toFixed(1)
      : 0;

    return successResponse({
      picks: picks.results,
      stats: {
        totalPicks: stats.totalPicks || 0,
        won: stats.won || 0,
        lost: stats.lost || 0,
        winRate: parseFloat(winRate),
        totalROI: 0
      }
    }, null, corsHeaders);
  } catch (error) {
    return errorResponse('Failed to fetch archive', 500, null, corsHeaders);
  }
}

// ============================================================================
// ADMIN HANDLERS
// ============================================================================

async function handleAdminStats(env, corsHeaders) {
  try {
    const [userStats, pickStats, predictionStats, subStats] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as total FROM users').first(),
      env.DB.prepare(`
        SELECT
          COUNT(*) as totalPicks,
          SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
          SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
        FROM picks WHERE status IN ('won', 'lost')
      `).first(),
      env.DB.prepare('SELECT COUNT(*) as total FROM ai_predictions').first(),
      env.DB.prepare('SELECT COUNT(*) as total FROM subscribers').first()
    ]);

    const winRate = pickStats.totalPicks > 0
      ? ((pickStats.won / pickStats.totalPicks) * 100).toFixed(1)
      : 0;

    return successResponse({
      stats: {
        totalUsers: userStats.total || 0,
        totalPicks: predictionStats.total || 0,
        winRate: parseFloat(winRate),
        totalROI: 0,
        activeSubscribers: subStats.total || 0
      }
    }, null, corsHeaders);
  } catch (error) {
    return errorResponse('Failed to fetch stats', 500, null, corsHeaders);
  }
}

async function handleGetAllPicks(env, corsHeaders) {
  try {
    const picks = await env.DB.prepare(
      'SELECT * FROM picks ORDER BY date DESC LIMIT 100'
    ).all();

    const picksWithMatches = await Promise.all(
      picks.results.map(async (pick) => {
        const matches = await env.DB.prepare(
          'SELECT * FROM matches WHERE pick_id = ?'
        ).bind(pick.id).all();
        return { ...pick, matches: matches.results };
      })
    );

    return successResponse({ picks: picksWithMatches }, null, corsHeaders);
  } catch (error) {
    return errorResponse('Failed to fetch picks', 500, null, corsHeaders);
  }
}

async function handleGetAllUsers(env, corsHeaders) {
  try {
    const users = await env.DB.prepare(
      'SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC'
    ).all();
    return successResponse({ users: users.results }, null, corsHeaders);
  } catch (error) {
    return errorResponse('Failed to fetch users', 500, null, corsHeaders);
  }
}

async function handleGetPlatformSettings(env, corsHeaders) {
  try {
    const settings = await env.CACHE.get('platform_settings', { type: 'json' });
    return successResponse({
      settings: settings || {
        siteName: 'FootyFortunes',
        targetOddsMin: 2.5,
        targetOddsMax: 3.5,
        primaryColor: '#EAB308',
        secondaryColor: '#F59E0B',
        accentColor: '#10B981'
      }
    }, null, corsHeaders);
  } catch (error) {
    return errorResponse('Failed to fetch settings', 500, null, corsHeaders);
  }
}

async function handleUpdatePlatformSettings(request, env, corsHeaders) {
  try {
    const settings = await request.json();
    await env.CACHE.put('platform_settings', JSON.stringify(settings));
    return successResponse({}, 'Settings updated successfully', corsHeaders);
  } catch (error) {
    return errorResponse('Failed to update settings', 500, null, corsHeaders);
  }
}

// ============================================================================
// ROUTER
// ============================================================================

async function handleRequest(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Check rate limit for all API requests
  const rateLimitResult = await checkRateLimit(env, request, 'api');

  // ========================================
  // PUBLIC ROUTES (No Auth Required)
  // ========================================

  // Auth Routes
  if (path === '/api/auth/login' && method === 'POST') {
    const response = await handleLogin(request, env, corsHeaders);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/auth/register' && method === 'POST') {
    const response = await handleRegister(request, env, corsHeaders);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/auth/refresh' && method === 'POST') {
    const response = await handleRefreshToken(request, env, corsHeaders);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // Picks Routes (Public)
  if (path === '/api/picks/today' && method === 'GET') {
    const response = await handleGetTodaysPicksNew(env, corsHeaders);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/picks/archive' && method === 'GET') {
    const response = await handleGetArchiveNew(url, env, corsHeaders);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // Match Routes (Public)
  if (path === '/api/matches/today' && method === 'GET') {
    const response = await handleGetTodaysMatches(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/matches/live' && method === 'GET') {
    const response = await handleGetLiveMatches(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/matches/upcoming' && method === 'GET') {
    const response = await handleGetUpcomingMatches(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path.startsWith('/api/matches/') && method === 'GET' && path !== '/api/matches/today' && path !== '/api/matches/live' && path !== '/api/matches/upcoming') {
    const matchId = path.split('/')[3];
    const response = await handleGetMatchById(request, env, matchId);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // Predictions & Value Bets (Public)
  if (path === '/api/predictions/today' && method === 'GET') {
    const response = await handleGetTodaysPredictions(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/value-bets' && method === 'GET') {
    const response = await handleGetValueBets(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // Leagues (Public)
  if (path === '/api/leagues' && method === 'GET') {
    const response = await handleGetLeagues(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // Leaderboard (Public)
  if (path === '/api/leaderboard' && method === 'GET') {
    const response = await handleGetLeaderboard(request, env);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // ========================================
  // PROTECTED ROUTES (Auth Required)
  // ========================================

  if (path === '/api/auth/logout' && method === 'POST') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleLogout(request, env, corsHeaders, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetMe(env, corsHeaders, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // User Picks Routes (Protected)
  if (path === '/api/user/picks' && method === 'POST') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handlePlacePick(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/user/picks' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetUserPicks(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // User Stats (Protected)
  if (path === '/api/user/stats' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetUserStats(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // User Achievements (Protected)
  if (path === '/api/user/achievements' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetUserAchievements(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // Bankroll History (Protected)
  if (path === '/api/user/bankroll/history' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetBankrollHistory(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // User Profile & Settings Routes
  if (path === '/api/user/profile' && method === 'PUT') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleUpdateProfile(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/user/settings' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetSettings(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/user/settings' && method === 'PUT') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleUpdateSettings(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/user/password' && method === 'PUT') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleChangePassword(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // User Favorites Routes
  if (path === '/api/user/favorites' && method === 'GET') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleGetFavorites(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path.startsWith('/api/user/favorites/') && method === 'POST') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleAddFavorite(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path.startsWith('/api/user/favorites/') && method === 'DELETE') {
    const user = await requireAuth(request, env, corsHeaders);
    if (user instanceof Response) return user;

    const response = await handleRemoveFavorite(request, env, user);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  // ========================================
  // ADMIN ROUTES (Admin Auth Required)
  // ========================================

  if (path.startsWith('/api/admin/')) {
    const user = await requireAdmin(request, env, corsHeaders);
    if (user instanceof Response) return user;

    if (path === '/api/admin/stats' && method === 'GET') {
      const response = await handleAdminStats(env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/picks' && method === 'GET') {
      const response = await handleGetAllPicks(env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/users' && method === 'GET') {
      const response = await handleGetAllUsers(env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/settings' && method === 'GET') {
      const response = await handleGetPlatformSettings(env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/settings' && method === 'PUT') {
      const response = await handleUpdatePlatformSettings(request, env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/generate-picks' && method === 'POST') {
      const response = await handleGeneratePicks(env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    // Data Sync Routes (Admin only)
    if (path === '/api/admin/sync/today' && method === 'POST') {
      const response = await handleSyncTodaysMatches(request, env, user);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    // Settle Picks (Admin only)
    if (path === '/api/admin/settle-picks' && method === 'POST') {
      const response = await handleSettlePicks(request, env);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/sync/live' && method === 'POST') {
      const response = await handleSyncLiveMatches(request, env, user);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/sync/leagues' && method === 'POST') {
      const response = await handleSyncLeagues(request, env, user);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    // AI Prediction Routes (Admin only)
    if (path === '/api/admin/generate-predictions' && method === 'POST') {
      const response = await handleGeneratePredictions(request, env, user);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/delete-predictions' && method === 'DELETE') {
      const response = await handleDeletePredictions(env, user, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }
  }

  // 404 - Route not found
  return errorResponse('Endpoint not found', 404, null, corsHeaders);
}

// ============================================================================
// MAIN WORKER EXPORT
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders();

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsPreflightResponse(corsHeaders);
    }

    try {
      return await handleRequest(request, env, corsHeaders);
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse('Internal server error', 500, null, corsHeaders);
    }
  },

  // Scheduled tasks for data syncing and predictions
  async scheduled(event, env, ctx) {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();

    console.log(`Running scheduled task at ${hour}:${minute} UTC`);

    try {
      // 9 AM UTC: Full daily sync (leagues + matches + predictions)
      if (hour === 9 && minute === 0) {
        console.log('Starting daily data sync...');

        // 1. Sync major leagues
        console.log('Step 1: Syncing leagues...');
        await handleSyncLeagues(null, env, { role: 'admin' });

        // 2. Sync today's matches
        console.log('Step 2: Syncing today\'s matches...');
        await handleSyncTodaysMatches(null, env, { role: 'admin' });

        // 3. Generate AI predictions
        console.log('Step 3: Generating AI predictions...');
        await handleGeneratePredictions(null, env, { role: 'admin' });

        console.log('Daily sync completed successfully');
      }
      // 2 PM - 11 PM UTC (every 15 mins): Update live matches
      else if (hour >= 14 && hour <= 23 && minute % 15 === 0) {
        console.log('Updating live matches...');
        await handleSyncLiveMatches(null, env, { role: 'admin' });
        console.log('Live matches updated successfully');
      }
      // Every 30 mins: Settle finished matches and update bankrolls
      else if (minute % 30 === 0) {
        console.log('Settling finished matches...');
        await autoSettleFinishedMatches(env);
        console.log('Match settlement completed successfully');
      }
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  }
};

// Auto-settle all finished matches (called by cron)
async function autoSettleFinishedMatches(env) {
  try {
    // Get all finished matches with pending picks
    const finishedMatches = await env.DB.prepare(`
      SELECT DISTINCT m.id, m.home_score, m.away_score
      FROM matches m
      JOIN user_picks up ON m.id = up.match_id
      WHERE m.status = 'FT'
        AND up.status = 'pending'
        AND m.home_score IS NOT NULL
        AND m.away_score IS NOT NULL
    `).all();

    let totalSettled = 0;

    for (const match of finishedMatches.results) {
      // Determine actual outcome
      let actualOutcome;
      if (match.home_score > match.away_score) {
        actualOutcome = 'home';
      } else if (match.away_score > match.home_score) {
        actualOutcome = 'away';
      } else {
        actualOutcome = 'draw';
      }

      // Get all pending picks for this match
      const picks = await env.DB.prepare(`
        SELECT * FROM user_picks
        WHERE match_id = ? AND status = 'pending'
      `).bind(match.id).all();

      // Settle each pick
      for (const pick of picks.results) {
        const won = pick.predicted_outcome === actualOutcome;
        const actualReturn = won ? pick.potential_return : 0;
        const profit = won ? (pick.potential_return - pick.stake_amount) : -pick.stake_amount;
        const newStatus = won ? 'won' : 'lost';

        // Update pick status
        await env.DB.prepare(`
          UPDATE user_picks
          SET status = ?, actual_outcome = ?, actual_return = ?, settled_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(newStatus, actualOutcome, actualReturn, pick.id).run();

        // Update user bankroll and stats
        if (won) {
          // Add winnings to bankroll
          await env.DB.prepare(`
            UPDATE user_betting_stats
            SET current_bankroll = current_bankroll + ?,
                total_wins = total_wins + 1,
                total_profit = total_profit + ?,
                pending_picks = pending_picks - 1,
                win_streak = win_streak + 1,
                best_streak = MAX(best_streak, win_streak + 1)
            WHERE user_id = ?
          `).bind(actualReturn, profit, pick.user_id).run();

          // Log transaction
          const userStats = await env.DB.prepare(
            'SELECT current_bankroll FROM user_betting_stats WHERE user_id = ?'
          ).bind(pick.user_id).first();

          await env.DB.prepare(`
            INSERT INTO bankroll_history (
              user_id, transaction_type, amount, balance_after,
              related_pick_id, description, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            pick.user_id,
            'bet_won',
            actualReturn,
            userStats.current_bankroll,
            pick.id,
            `Bet won: ${pick.predicted_outcome} (GH₵${profit.toFixed(2)} profit)`,
            new Date().toISOString()
          ).run();

          // Award XP
          await awardXP(env, pick.user_id, 20, 'pick_won', pick.id, 'Pick won');
        } else {
          // Lost bet - update loss stats
          await env.DB.prepare(`
            UPDATE user_betting_stats
            SET total_losses = total_losses + 1,
                total_profit = total_profit + ?,
                pending_picks = pending_picks - 1,
                win_streak = 0
            WHERE user_id = ?
          `).bind(profit, pick.user_id).run();
        }

        totalSettled++;
      }
    }

    console.log(`Auto-settled ${totalSettled} picks across ${finishedMatches.results.length} finished matches`);
    return totalSettled;
  } catch (error) {
    console.error('Auto-settlement error:', error);
    return 0;
  }
}

// Helper function to award XP (used by cron)
async function awardXP(env, userId, amount, actionType, relatedId, description) {
  try {
    await env.DB.prepare(`
      INSERT INTO xp_transactions (user_id, xp_amount, action_type, related_id, description)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, amount, actionType, relatedId, description).run();

    await env.DB.prepare(`
      UPDATE user_levels
      SET current_xp = current_xp + ?, total_xp = total_xp + ?
      WHERE user_id = ?
    `).bind(amount, amount, userId).run();
  } catch (error) {
    console.error('Error awarding XP:', error);
  }
}
