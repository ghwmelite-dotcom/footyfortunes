# Scheduled Tasks Configuration

## Overview
FootyFortunes uses Cloudflare Cron Triggers to automatically sync match data, update live scores, and generate AI predictions.

## Configured Schedules

### 1. Daily Data Sync (9 AM UTC)
**Cron:** `0 9 * * *`
**Tasks:**
1. Sync major leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, etc.)
2. Sync today's matches from API-Football
3. Generate AI predictions for all upcoming matches

**API Calls:** ~3 requests
**Time:** 9 AM UTC = 9 AM GMT (London) / 10 AM WAT (Ghana)

### 2. Live Match Updates (2 PM - 11 PM UTC)
**Cron:** `*/15 14-23 * * *` (every 15 minutes)
**Tasks:**
1. Update all live match scores and statistics

**API Calls:** ~36 requests during match hours (4 per hour × 9 hours)
**Time:** 2 PM - 11 PM UTC = 2 PM - 11 PM GMT / 3 PM - 12 AM WAT

## Total API Usage

With the free tier (100 requests/day):
- Daily sync: 3 requests
- Live updates: 36 requests
- **Total: ~39 requests/day**
- **Remaining: ~61 requests for manual operations**

## Manual Sync Endpoints (Admin Only)

If you need to manually trigger syncs:

```bash
# Set your admin token
export ADMIN_TOKEN="your-jwt-token"
export API_URL="https://footyfortunes-api.ghwmelite.workers.dev"

# Sync leagues
curl -X POST $API_URL/api/admin/sync/leagues \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Sync today's matches
curl -X POST $API_URL/api/admin/sync/today \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update live matches
curl -X POST $API_URL/api/admin/sync/live \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Generate predictions
curl -X POST $API_URL/api/admin/generate-predictions \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Monitoring

Check the Cloudflare dashboard for cron execution logs:
1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → footyfortunes-api → Logs
3. Filter by: "Scheduled" or search for "Running scheduled task"

## Notes

- All times are in UTC (Coordinated Universal Time)
- Ghana is in WAT (West Africa Time) = UTC+1
- Predictions are only generated for upcoming matches (status: NS)
- Live updates only fetch matches with LIVE status to minimize API calls
- Cron triggers are subject to Cloudflare's scheduling guarantees (typically within 1 minute)

## Troubleshooting

**If predictions aren't being generated:**
1. Check that matches have been synced (should run at 9 AM UTC daily)
2. Verify matches have status 'NS' (Not Started)
3. Check worker logs for errors during the 9 AM sync

**If live scores aren't updating:**
1. Verify current time is between 2 PM - 11 PM UTC
2. Check that matches exist with LIVE status
3. Review API usage to ensure you haven't hit the daily limit

**If you hit API limits:**
- Upgrade to API-Football Basic plan (3,000 requests/day for GH₵280/month)
- Or reduce live update frequency by changing cron to `*/30 14-23 * * *` (every 30 mins)
