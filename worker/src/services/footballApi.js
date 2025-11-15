/**
 * API-Football Integration Service
 * Fetches real-time football data from API-Football (RapidAPI)
 */

const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

export class FootballApiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Make request to API-Football
   */
  async request(endpoint, params = {}) {
    const url = new URL(`${API_FOOTBALL_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (!response.ok) {
        throw new Error(`API-Football error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API-Football request failed:', error);
      return null;
    }
  }

  /**
   * Get today's fixtures for specified leagues
   */
  async getTodaysFixtures(leagueIds = [39, 140, 78, 61, 135]) {
    // Default leagues: Premier League (39), La Liga (140), Bundesliga (78), Ligue 1 (61), Serie A (135)
    const today = new Date().toISOString().split('T')[0];

    const fixtures = [];
    for (const leagueId of leagueIds) {
      const data = await this.request('/fixtures', {
        league: leagueId,
        date: today,
        season: new Date().getFullYear()
      });

      if (data && data.response) {
        fixtures.push(...data.response);
      }
    }

    return fixtures;
  }

  /**
   * Get upcoming fixtures (next 7 days)
   */
  async getUpcomingFixtures(leagueIds = [39, 140, 78, 61, 135], days = 7) {
    const fixtures = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      for (const leagueId of leagueIds) {
        const data = await this.request('/fixtures', {
          league: leagueId,
          date: dateStr,
          season: new Date().getFullYear()
        });

        if (data && data.response) {
          fixtures.push(...data.response);
        }
      }
    }

    return fixtures;
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId, leagueId, season) {
    const data = await this.request('/teams/statistics', {
      team: teamId,
      league: leagueId,
      season: season || new Date().getFullYear()
    });

    return data?.response;
  }

  /**
   * Get head-to-head statistics
   */
  async getHeadToHead(team1Id, team2Id) {
    const data = await this.request('/fixtures/headtohead', {
      h2h: `${team1Id}-${team2Id}`,
      last: 10
    });

    return data?.response;
  }

  /**
   * Get fixture predictions from API-Football
   */
  async getFixturePredictions(fixtureId) {
    const data = await this.request('/predictions', {
      fixture: fixtureId
    });

    return data?.response?.[0];
  }

  /**
   * Get live fixtures
   */
  async getLiveFixtures() {
    const data = await this.request('/fixtures', {
      live: 'all'
    });

    return data?.response || [];
  }

  /**
   * Get fixture odds
   */
  async getFixtureOdds(fixtureId) {
    const data = await this.request('/odds', {
      fixture: fixtureId,
      bookmaker: 1 // Bet365
    });

    return data?.response;
  }
}

/**
 * Mock Football API Service for development/fallback
 */
export class MockFootballApiService {
  async getTodaysFixtures() {
    const today = new Date().toISOString().split('T')[0];

    return [
      {
        fixture: {
          id: 854321,
          date: `${today}T17:30:00+00:00`,
          status: { short: 'NS' }
        },
        league: {
          id: 39,
          name: 'Premier League',
          country: 'England',
          logo: 'https://media.api-sports.io/football/leagues/39.png'
        },
        teams: {
          home: { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
          away: { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' }
        },
        venue: { name: 'Emirates Stadium', city: 'London' }
      },
      {
        fixture: {
          id: 854322,
          date: `${today}T20:00:00+00:00`,
          status: { short: 'NS' }
        },
        league: {
          id: 140,
          name: 'La Liga',
          country: 'Spain',
          logo: 'https://media.api-sports.io/football/leagues/140.png'
        },
        teams: {
          home: { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
          away: { id: 530, name: 'Atletico Madrid', logo: 'https://media.api-sports.io/football/teams/530.png' }
        },
        venue: { name: 'Camp Nou', city: 'Barcelona' }
      },
      {
        fixture: {
          id: 854323,
          date: `${today}T18:30:00+00:00`,
          status: { short: 'NS' }
        },
        league: {
          id: 78,
          name: 'Bundesliga',
          country: 'Germany',
          logo: 'https://media.api-sports.io/football/leagues/78.png'
        },
        teams: {
          home: { id: 157, name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/157.png' },
          away: { id: 165, name: 'Borussia Dortmund', logo: 'https://media.api-sports.io/football/teams/165.png' }
        },
        venue: { name: 'Allianz Arena', city: 'Munich' }
      }
    ];
  }

  async getUpcomingFixtures() {
    return this.getTodaysFixtures();
  }

  async getTeamStats() {
    return {
      form: 'WWDWL',
      goals: { for: { total: { home: 25, away: 18 } }, against: { total: { home: 8, away: 12 } } }
    };
  }

  async getHeadToHead() {
    return [];
  }

  async getFixturePredictions() {
    return {
      predictions: {
        winner: { id: null, name: 'Draw', comment: 'Evenly matched teams' },
        percent: { home: '40%', draw: '30%', away: '30%' }
      }
    };
  }

  async getLiveFixtures() {
    return [];
  }

  async getFixtureOdds() {
    return [];
  }
}

export default FootballApiService;
