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
    const [userStats, pickStats, subStats] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as total FROM users').first(),
      env.DB.prepare(`
        SELECT
          COUNT(*) as totalPicks,
          SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
          SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
        FROM picks WHERE status IN ('won', 'lost')
      `).first(),
      env.DB.prepare('SELECT COUNT(*) as total FROM subscribers').first()
    ]);

    const winRate = pickStats.totalPicks > 0
      ? ((pickStats.won / pickStats.totalPicks) * 100).toFixed(1)
      : 0;

    return successResponse({
      stats: {
        totalUsers: userStats.total || 0,
        totalPicks: pickStats.totalPicks || 0,
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

async function handleGetSettings(env, corsHeaders) {
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

async function handleUpdateSettings(request, env, corsHeaders) {
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
    const response = await handleGetTodaysPicks(env, corsHeaders);
    return addRateLimitHeaders(response, rateLimitResult);
  }

  if (path === '/api/picks/archive' && method === 'GET') {
    const response = await handleGetArchive(url, env, corsHeaders);
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
      const response = await handleGetSettings(env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/settings' && method === 'PUT') {
      const response = await handleUpdateSettings(request, env, corsHeaders);
      return addRateLimitHeaders(response, rateLimitResult);
    }

    if (path === '/api/admin/generate-picks' && method === 'POST') {
      const result = await generateAIPicks(env);
      const response = successResponse(result, null, corsHeaders);
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

  // Scheduled task for daily AI picks
  async scheduled(event, env, ctx) {
    ctx.waitUntil(generateAIPicks(env));
  }
};
