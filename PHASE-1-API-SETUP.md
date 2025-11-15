# Phase 1: API-Football Setup Guide

## ✅ What's Been Implemented

### Database Tables Created
- ✅ `leagues` - Football leagues/competitions
- ✅ `teams` - Team data
- ✅ `matches` - Match fixtures with scores and status
- ✅ `match_stats` - Match statistics (possession, shots, etc.)
- ✅ `match_events` - Goals, cards, substitutions
- ✅ `odds` - Betting odds from multiple bookmakers
- ✅ `ai_predictions` - AI-generated match predictions
- ✅ `ai_models` - Track AI model performance
- ✅ `value_bets` - High-value betting opportunities
- ✅ `api_sync_log` - API request logging
- ✅ `team_form` - Recent team performance
- ✅ `head_to_head` - H2H history between teams

### Backend Services Created
- ✅ `apiFootballService.js` - API-Football integration layer
- ✅ `dataSyncService.js` - Data fetching and transformation
- ✅ `matchHandlers.js` - API endpoints for match data

### API Endpoints Created

#### Public Endpoints (No Auth Required)
- `GET /api/matches/today` - Today's matches
- `GET /api/matches/live` - Live matches
- `GET /api/matches/upcoming` - Upcoming matches (next 7 days)
- `GET /api/matches/:id` - Match details with stats, events, odds
- `GET /api/predictions/today` - AI predictions for today
- `GET /api/value-bets` - High-value betting opportunities
- `GET /api/leagues` - All leagues

#### Admin Endpoints (Requires Admin Auth)
- `POST /api/admin/sync/today` - Sync today's matches
- `POST /api/admin/sync/live` - Update live match data
- `POST /api/admin/sync/leagues` - Sync major leagues

---

## 🚀 API-Football Setup Instructions

### Step 1: Get API-Football Access

1. **Visit RapidAPI**
   - Go to: https://rapidapi.com/api-sports/api/api-football
   - Sign up for a free RapidAPI account (if you don't have one)

2. **Subscribe to API-Football**
   - Click "Subscribe to Test"
   - Choose a plan:
     - **Free Plan**: 100 requests/day (perfect for testing)
     - **Basic Plan ($19/month)**: 3,000 requests/day
     - **Pro Plan ($59/month)**: Unlimited requests
   - For FootyFortunes MVP, start with the **Free Plan**

3. **Get Your API Key**
   - After subscribing, you'll see your API key at the top right
   - Copy it - it looks like: `abc123def456ghi789jkl012mno345pqr678`

### Step 2: Set API Key in Cloudflare

**Option A: Using Wrangler CLI (Recommended - Secure)**

```bash
cd worker
npx wrangler secret put API_FOOTBALL_KEY
# Paste your API key when prompted
```

**Option B: Using Cloudflare Dashboard**

1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → footyfortunes-api → Settings → Variables
3. Under "Environment Variables", click "Add variable"
4. Name: `API_FOOTBALL_KEY`
5. Value: Paste your API key
6. Click "Encrypt" (makes it a secret)
7. Click "Save"

### Step 3: Test the Integration

1. **Deploy the worker:**
   ```bash
   cd worker
   npm run deploy
   ```

2. **Sync major leagues (as admin):**
   ```bash
   curl -X POST https://footyfortunes-api.ghwmelite.workers.dev/api/admin/sync/leagues \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **Sync today's matches:**
   ```bash
   curl -X POST https://footyfortunes-api.ghwmelite.workers.dev/api/admin/sync/today \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

4. **Fetch today's matches (public):**
   ```bash
   curl https://footyfortunes-api.ghwmelite.workers.dev/api/matches/today
   ```

---

## 📊 API-Football Coverage

### Included Leagues (Pre-configured)
- ⚽ **Premier League** (England) - League ID: 39
- ⚽ **La Liga** (Spain) - League ID: 140
- ⚽ **Bundesliga** (Germany) - League ID: 78
- ⚽ **Serie A** (Italy) - League ID: 135
- ⚽ **Ligue 1** (France) - League ID: 61
- 🏆 **UEFA Champions League** - League ID: 2
- 🏆 **UEFA Europa League** - League ID: 3
- 🌍 **CAF Champions League** - League ID: 848
- 🇬🇭 **Ghana Premier League** - League ID: 116

### Available Data
- ✅ Live scores (updated every 15 seconds)
- ✅ Match statistics (possession, shots, passes, etc.)
- ✅ Match events (goals, cards, substitutions)
- ✅ Pre-match & live odds from 60+ bookmakers
- ✅ Team information & logos
- ✅ League standings
- ✅ Head-to-head history
- ✅ API-Football's AI predictions

---

## 🔄 Data Syncing Strategy

### Free Plan (100 requests/day)
With 100 requests, you can:
- Sync 5 major leagues → 5 requests
- Fetch today's fixtures → 1 request
- Update live matches every 5 mins (12 updates/hour) → 96 requests during match hours

**Recommended Schedule:**
- **Daily at 8 AM**: Sync major leagues (5 requests)
- **Daily at 9 AM**: Sync today's fixtures (1 request)
- **During matches (2-11 PM)**: Update live every 5 mins (90 requests)

### Paid Plan (3,000+ requests/day)
With more requests, you can:
- Sync all available leagues
- Fetch fixtures for next 7 days
- Update live matches every 15-30 seconds
- Sync odds for all matches
- Fetch detailed statistics and events

---

## ⚡ Quick Start Commands

### As Admin User:

```bash
# Set your admin token
export ADMIN_TOKEN="your-jwt-token-here"

# Sync leagues
curl -X POST https://footyfortunes-api.ghwmelite.workers.dev/api/admin/sync/leagues \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Sync today's matches
curl -X POST https://footyfortunes-api.ghwmelite.workers.dev/api/admin/sync/today \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update live matches
curl -X POST https://footyfortunes-api.ghwmelite.workers.dev/api/admin/sync/live \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### As Regular User:

```bash
# Get today's matches
curl https://footyfortunes-api.ghwmelite.workers.dev/api/matches/today

# Get live matches
curl https://footyfortunes-api.ghwmelite.workers.dev/api/matches/live

# Get upcoming matches
curl https://footyfortunes-api.ghwmelite.workers.dev/api/matches/upcoming

# Get today's AI predictions
curl https://footyfortunes-api.ghwmelite.workers.dev/api/predictions/today

# Get value bets
curl https://footyfortunes-api.ghwmelite.workers.dev/api/value-bets
```

---

## 🤖 Next Steps

1. **Set API Key**: Follow Step 1-2 above to get and set your API-Football key
2. **Test Integration**: Run the commands in Step 3
3. **Build AI Predictions**: Create algorithm to analyze matches and generate predictions
4. **Set Up Cron Jobs**: Automate data syncing using Cloudflare Cron Triggers
5. **Update Frontend**: Connect frontend to real match data endpoints

---

## 📝 Notes

- **Free tier limitations**: 100 requests/day, good for MVP and testing
- **Upgrade timing**: Upgrade to paid plan when you have 50+ active users
- **Data freshness**: Live matches updated every 15 seconds on API-Football
- **Caching**: Consider implementing caching to reduce API calls
- **Rate limiting**: Track API usage in `api_sync_log` table

---

## 🔗 Useful Links

- **API-Football Documentation**: https://www.api-football.com/documentation-v3
- **RapidAPI Dashboard**: https://rapidapi.com/developer/dashboard
- **API-Football Pricing**: https://rapidapi.com/api-sports/api/api-football/pricing
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Cloudflare Cron Triggers**: https://developers.cloudflare.com/workers/configuration/cron-triggers/

---

**Status**: Ready for API key setup and testing! 🚀
