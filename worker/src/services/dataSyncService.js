/**
 * Data Sync Service
 * Handles syncing data from API-Football to our database
 */

import * as apiFootball from './apiFootballService.js';

/**
 * Sync today's fixtures
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Sync result
 */
export async function syncTodaysFixtures(env) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const fixtures = await apiFootball.fetchFixturesByDate(today, env);

  let synced = 0;
  let errors = 0;

  for (const fixture of fixtures) {
    try {
      await saveFixture(fixture, env.DB);
      synced++;
    } catch (error) {
      console.error(`Error saving fixture ${fixture.fixture.id}:`, error);
      errors++;
    }
  }

  return { synced, errors, total: fixtures.length };
}

/**
 * Sync live fixtures
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Sync result
 */
export async function syncLiveFixtures(env) {
  const fixtures = await apiFootball.fetchLiveFixtures(env);

  let synced = 0;
  let errors = 0;

  for (const fixture of fixtures) {
    try {
      await updateFixture(fixture, env.DB);
      synced++;
    } catch (error) {
      console.error(`Error updating fixture ${fixture.fixture.id}:`, error);
      errors++;
    }
  }

  return { synced, errors, total: fixtures.length };
}

/**
 * Sync fixtures for a specific league and season
 * @param {number} leagueId - League ID
 * @param {number} season - Season year
 * @param {object} env - Environment variables
 * @returns {Promise<object>} Sync result
 */
export async function syncLeagueFixtures(leagueId, season, env) {
  // First, sync the league
  await syncLeague(leagueId, season, env);

  // Then sync fixtures
  const fixtures = await apiFootball.fetchLeagueFixtures(leagueId, season, env);

  let synced = 0;
  let errors = 0;

  for (const fixture of fixtures) {
    try {
      await saveFixture(fixture, env.DB);
      synced++;
    } catch (error) {
      console.error(`Error saving fixture ${fixture.fixture.id}:`, error);
      errors++;
    }
  }

  return { synced, errors, total: fixtures.length };
}

/**
 * Sync a single league
 * @param {number} leagueId - League ID
 * @param {number} season - Season year
 * @param {object} env - Environment variables
 */
async function syncLeague(leagueId, season, env) {
  const leagues = await apiFootball.fetchLeagues(null, season, env);
  const league = leagues.find(l => l.league.id === leagueId);

  if (!league) {
    throw new Error(`League ${leagueId} not found`);
  }

  await env.DB.prepare(`
    INSERT OR REPLACE INTO leagues
    (id, api_league_id, name, country, logo, flag, season, type, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    league.league.id,
    league.league.id,
    league.league.name,
    league.country.name,
    league.league.logo,
    league.country.flag,
    league.seasons[0]?.year || season,
    league.league.type
  ).run();
}

/**
 * Save or update a fixture in the database
 * @param {object} fixture - Fixture data from API-Football
 * @param {object} db - D1 database
 */
async function saveFixture(fixture, db) {
  const { fixture: fix, league, teams, goals, score } = fixture;

  // Ensure league exists
  await db.prepare(`
    INSERT OR IGNORE INTO leagues
    (id, api_league_id, name, country, logo, flag, season)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    league.id,
    league.id,
    league.name,
    league.country,
    league.logo,
    league.flag,
    league.season
  ).run();

  // Ensure teams exist
  await saveTeam(teams.home, db);
  await saveTeam(teams.away, db);

  // Get team IDs from database
  const homeTeam = await db.prepare('SELECT id FROM teams WHERE api_team_id = ?')
    .bind(teams.home.id).first();
  const awayTeam = await db.prepare('SELECT id FROM teams WHERE api_team_id = ?')
    .bind(teams.away.id).first();

  // Check if teams exist, skip if not
  if (!homeTeam || !awayTeam) {
    console.warn(`Skipping fixture ${fix.id} - teams not found`);
    return;
  }

  // Save/update fixture - use INSERT OR IGNORE + UPDATE pattern
  const existing = await db.prepare('SELECT id FROM matches WHERE api_fixture_id = ?')
    .bind(fix.id).first();

  if (existing) {
    // Update existing match
    await db.prepare(`
      UPDATE matches
      SET status = ?, status_long = ?, elapsed = ?,
          home_score = ?, away_score = ?,
          home_halftime_score = ?, away_halftime_score = ?,
          home_fulltime_score = ?, away_fulltime_score = ?,
          last_updated = datetime('now')
      WHERE api_fixture_id = ?
    `).bind(
      fix.status.short,
      fix.status.long,
      fix.status.elapsed,
      goals.home,
      goals.away,
      score.halftime.home,
      score.halftime.away,
      score.fulltime.home,
      score.fulltime.away,
      fix.id
    ).run();
  } else {
    // Insert new match
    await db.prepare(`
      INSERT INTO matches
      (api_fixture_id, league_id, season, round, match_date, match_time, timezone, timestamp,
       home_team_id, away_team_id, status, status_long, elapsed,
       home_score, away_score, home_halftime_score, away_halftime_score,
       home_fulltime_score, away_fulltime_score,
       venue_name, venue_city, referee, last_updated, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?,
              ?, ?,
              ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
    fix.id,
    league.id,
    league.season,
    league.round,
    fix.date.split('T')[0], // Date only
    fix.date.split('T')[1]?.split('+')[0], // Time only
    fix.timezone,
    fix.timestamp,
    homeTeam?.id,
    awayTeam?.id,
    fix.status.short,
    fix.status.long,
    fix.status.elapsed,
    goals.home,
    goals.away,
    score.halftime.home,
    score.halftime.away,
    score.fulltime.home,
    score.fulltime.away,
    fix.venue.name,
    fix.venue.city,
    fix.referee
  ).run();
  }
}

/**
 * Update an existing fixture (for live updates)
 * @param {object} fixture - Fixture data from API-Football
 * @param {object} db - D1 database
 */
async function updateFixture(fixture, db) {
  const { fixture: fix, goals, score } = fixture;

  await db.prepare(`
    UPDATE matches
    SET status = ?, status_long = ?, elapsed = ?,
        home_score = ?, away_score = ?,
        home_halftime_score = ?, away_halftime_score = ?,
        home_fulltime_score = ?, away_fulltime_score = ?,
        last_updated = datetime('now')
    WHERE api_fixture_id = ?
  `).bind(
    fix.status.short,
    fix.status.long,
    fix.status.elapsed,
    goals.home,
    goals.away,
    score.halftime.home,
    score.halftime.away,
    score.fulltime.home,
    score.fulltime.away,
    fix.id
  ).run();
}

/**
 * Save or update a team in the database
 * @param {object} team - Team data from API-Football
 * @param {object} db - D1 database
 */
async function saveTeam(team, db) {
  // Use INSERT OR IGNORE to avoid breaking auto-increment IDs
  await db.prepare(`
    INSERT OR IGNORE INTO teams
    (api_team_id, name, code, country, founded, logo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    team.id,
    team.name,
    team.code || null,
    team.country || null,
    team.founded || null,
    team.logo || null
  ).run();

  // Update if team already exists
  await db.prepare(`
    UPDATE teams
    SET name = ?, code = ?, country = ?, founded = ?, logo = ?, updated_at = datetime('now')
    WHERE api_team_id = ?
  `).bind(
    team.name,
    team.code || null,
    team.country || null,
    team.founded || null,
    team.logo || null,
    team.id
  ).run();
}

/**
 * Sync odds for a fixture
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 */
export async function syncFixtureOdds(fixtureId, env) {
  const oddsData = await apiFootball.fetchFixtureOdds(fixtureId, env);

  // Get match ID from database
  const match = await env.DB.prepare('SELECT id FROM matches WHERE api_fixture_id = ?')
    .bind(fixtureId).first();

  if (!match) {
    throw new Error(`Match with fixture ID ${fixtureId} not found`);
  }

  let synced = 0;

  for (const bookmakerData of oddsData) {
    const bookmaker = bookmakerData.bookmakers[0]; // Take first bookmaker
    if (!bookmaker) continue;

    for (const bet of bookmaker.bets) {
      for (const value of bet.values) {
        try {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO odds
            (match_id, bookmaker, bookmaker_id, market_type, market_id, value_name, odd, is_live, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
          `).bind(
            match.id,
            bookmaker.name,
            bookmaker.id,
            bet.name,
            bet.id,
            value.value,
            parseFloat(value.odd)
          ).run();

          synced++;
        } catch (error) {
          console.error(`Error saving odds:`, error);
        }
      }
    }
  }

  return { synced };
}

/**
 * Sync fixture statistics
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 */
export async function syncFixtureStatistics(fixtureId, env) {
  const stats = await apiFootball.fetchFixtureStatistics(fixtureId, env);

  // Get match ID from database
  const match = await env.DB.prepare('SELECT id FROM matches WHERE api_fixture_id = ?')
    .bind(fixtureId).first();

  if (!match) {
    throw new Error(`Match with fixture ID ${fixtureId} not found`);
  }

  let synced = 0;

  for (const teamStats of stats) {
    const team = await env.DB.prepare('SELECT id FROM teams WHERE api_team_id = ?')
      .bind(teamStats.team.id).first();

    if (!team) continue;

    const statsObj = {};
    for (const stat of teamStats.statistics) {
      statsObj[stat.type] = stat.value;
    }

    try {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO match_stats
        (match_id, team_id, possession, shots_on_goal, shots_off_goal, total_shots,
         blocked_shots, shots_inside_box, shots_outside_box, total_passes, accurate_passes,
         fouls, corners, offsides, yellow_cards, red_cards, goalkeeper_saves)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        match.id,
        team.id,
        statsObj['Ball Possession'] ? parseInt(statsObj['Ball Possession']) : null,
        statsObj['Shots on Goal'] || null,
        statsObj['Shots off Goal'] || null,
        statsObj['Total Shots'] || null,
        statsObj['Blocked Shots'] || null,
        statsObj['Shots insidebox'] || null,
        statsObj['Shots outsidebox'] || null,
        statsObj['Total passes'] || null,
        statsObj['Passes accurate'] || null,
        statsObj['Fouls'] || null,
        statsObj['Corner Kicks'] || null,
        statsObj['Offsides'] || null,
        statsObj['Yellow Cards'] || null,
        statsObj['Red Cards'] || null,
        statsObj['Goalkeeper Saves'] || null
      ).run();

      synced++;
    } catch (error) {
      console.error(`Error saving match stats:`, error);
    }
  }

  return { synced };
}

/**
 * Sync fixture events (goals, cards, etc.)
 * @param {number} fixtureId - Fixture ID
 * @param {object} env - Environment variables
 */
export async function syncFixtureEvents(fixtureId, env) {
  const events = await apiFootball.fetchFixtureEvents(fixtureId, env);

  // Get match ID from database
  const match = await env.DB.prepare('SELECT id FROM matches WHERE api_fixture_id = ?')
    .bind(fixtureId).first();

  if (!match) {
    throw new Error(`Match with fixture ID ${fixtureId} not found`);
  }

  let synced = 0;

  for (const event of events) {
    const team = await env.DB.prepare('SELECT id FROM teams WHERE api_team_id = ?')
      .bind(event.team.id).first();

    if (!team) continue;

    try {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO match_events
        (match_id, team_id, time_elapsed, time_extra, type, detail,
         player_name, player_id, assist_name, assist_id, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        match.id,
        team.id,
        event.time.elapsed,
        event.time.extra,
        event.type,
        event.detail,
        event.player.name,
        event.player.id,
        event.assist.name,
        event.assist.id,
        event.comments
      ).run();

      synced++;
    } catch (error) {
      console.error(`Error saving match event:`, error);
    }
  }

  return { synced };
}

/**
 * Sync major leagues (Premier League, La Liga, etc.)
 * @param {object} env - Environment variables
 */
export async function syncMajorLeagues(env) {
  const majorLeagues = [
    { id: 39, name: 'Premier League', country: 'England' },
    { id: 140, name: 'La Liga', country: 'Spain' },
    { id: 78, name: 'Bundesliga', country: 'Germany' },
    { id: 135, name: 'Serie A', country: 'Italy' },
    { id: 61, name: 'Ligue 1', country: 'France' },
    { id: 2, name: 'UEFA Champions League', country: 'World' },
    { id: 3, name: 'UEFA Europa League', country: 'World' },
    { id: 848, name: 'CAF Champions League', country: 'World' },
    { id: 116, name: 'Ghana Premier League', country: 'Ghana' }
  ];

  const season = new Date().getFullYear();

  for (const league of majorLeagues) {
    try {
      await syncLeague(league.id, season, env);
      console.log(`Synced ${league.name}`);
    } catch (error) {
      console.error(`Error syncing ${league.name}:`, error);
    }
  }

  return { synced: majorLeagues.length };
}
