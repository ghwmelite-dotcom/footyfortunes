/**
 * API-Football Service
 * Handles all communication with API-Football (via RapidAPI)
 */

const API_BASE_URL = 'https://v3.football.api-sports.io';

/**
 * Make a request to API-Football
 * @param {string} endpoint - API endpoint (e.g., '/fixtures')
 * @param {object} params - Query parameters
 * @param {object} env - Environment variables
 * @returns {Promise<object>} API response
 */
async function makeApiRequest(endpoint, params = {}, env) {
  const apiKey = env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY not configured');
  }

  // Build query string
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    // Log API request
    await logApiRequest(env.DB, {
      endpoint,
      params: JSON.stringify(params),
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      recordsFetched: data.response?.length || 0,
      requestsRemaining: response.headers.get('x-ratelimit-requests-remaining'),
      rateLimitReset: response.headers.get('x-ratelimit-requests-limit'),
      responseTimeMs: responseTime
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} - ${data.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    // Log error
    await logApiRequest(env.DB, {
      endpoint,
      params: JSON.stringify(params),
      status: 'error',
      errorMessage: error.message,
      responseTimeMs: Date.now() - startTime
    });

    throw error;
  }
}

/**
 * Log API request to database
 */
async function logApiRequest(db, logData) {
  try {
    await db.prepare(`
      INSERT INTO api_sync_log
      (endpoint, request_params, status, http_status, records_fetched,
       error_message, requests_remaining, rate_limit_reset, response_time_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      logData.endpoint,
      logData.params,
      logData.status,
      logData.httpStatus || null,
      logData.recordsFetched || 0,
      logData.errorMessage || null,
      logData.requestsRemaining || null,
      logData.rateLimitReset || null,
      logData.responseTimeMs || null
    ).run();
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
}

/**
 * Fetch fixtures (matches) for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of fixtures
 */
export async function fetchFixturesByDate(date, env) {
  const data = await makeApiRequest('/fixtures', { date }, env);
  return data.response || [];
}

/**
 * Fetch live fixtures
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of live fixtures
 */
export async function fetchLiveFixtures(env) {
  const data = await makeApiRequest('/fixtures', { live: 'all' }, env);
  return data.response || [];
}

/**
 * Fetch fixtures for a specific league and season
 * @param {number} leagueId - League ID
 * @param {number} season - Season year
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of fixtures
 */
export async function fetchLeagueFixtures(leagueId, season, env) {
  const data = await makeApiRequest('/fixtures', {
    league: leagueId,
    season: season
  }, env);
  return data.response || [];
}

/**
 * Fetch fixture by ID
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Fixture data
 */
export async function fetchFixtureById(fixtureId, env) {
  const data = await makeApiRequest('/fixtures', { id: fixtureId }, env);
  return data.response?.[0] || null;
}

/**
 * Fetch fixture statistics
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Statistics for both teams
 */
export async function fetchFixtureStatistics(fixtureId, env) {
  const data = await makeApiRequest('/fixtures/statistics', { fixture: fixtureId }, env);
  return data.response || [];
}

/**
 * Fetch fixture events (goals, cards, etc.)
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of events
 */
export async function fetchFixtureEvents(fixtureId, env) {
  const data = await makeApiRequest('/fixtures/events', { fixture: fixtureId }, env);
  return data.response || [];
}

/**
 * Fetch odds for a fixture
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of odds from different bookmakers
 */
export async function fetchFixtureOdds(fixtureId, env) {
  const data = await makeApiRequest('/odds', { fixture: fixtureId }, env);
  return data.response || [];
}

/**
 * Fetch leagues
 * @param {string} country - Country name (optional)
 * @param {number} season - Season year (optional)
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of leagues
 */
export async function fetchLeagues(country, season, env) {
  const params = {};
  if (country) params.country = country;
  if (season) params.season = season;

  const data = await makeApiRequest('/leagues', params, env);
  return data.response || [];
}

/**
 * Fetch teams
 * @param {number} leagueId - League ID
 * @param {number} season - Season year
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of teams
 */
export async function fetchTeams(leagueId, season, env) {
  const data = await makeApiRequest('/teams', {
    league: leagueId,
    season: season
  }, env);
  return data.response || [];
}

/**
 * Fetch team by ID
 * @param {number} teamId - Team ID
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Team data
 */
export async function fetchTeamById(teamId, env) {
  const data = await makeApiRequest('/teams', { id: teamId }, env);
  return data.response?.[0] || null;
}

/**
 * Fetch team statistics for a league/season
 * @param {number} teamId - Team ID
 * @param {number} leagueId - League ID
 * @param {number} season - Season year
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Team statistics
 */
export async function fetchTeamStatistics(teamId, leagueId, season, env) {
  const data = await makeApiRequest('/teams/statistics', {
    team: teamId,
    league: leagueId,
    season: season
  }, env);
  return data.response || null;
}

/**
 * Fetch head to head matches between two teams
 * @param {number} team1Id - First team ID
 * @param {number} team2Id - Second team ID
 * @param {object} env - Environment variables
 * @returns {Promise<Array>} Array of h2h matches
 */
export async function fetchHeadToHead(team1Id, team2Id, env) {
  const data = await makeApiRequest('/fixtures/headtohead', {
    h2h: `${team1Id}-${team2Id}`
  }, env);
  return data.response || [];
}

/**
 * Fetch API-Football predictions for a fixture
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Predictions data
 */
export async function fetchApiPredictions(fixtureId, env) {
  const data = await makeApiRequest('/predictions', { fixture: fixtureId }, env);
  return data.response?.[0] || null;
}
