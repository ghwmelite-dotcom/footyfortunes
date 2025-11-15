# Database Migrations for FootyFortunes

This directory contains database migration files for Cloudflare D1.

## Structure

```
migrations/
├── 001_initial_schema.sql      # Initial comprehensive schema
├── 002_seed_data.sql           # Seed data (leagues, prediction types, etc.)
├── migrate.js                   # Migration runner script
└── README.md                    # This file
```

## Running Migrations

### Prerequisites

1. Install dependencies:
```bash
cd worker
npm install
```

2. Ensure `wrangler.toml` has D1 database configured:
```toml
[[d1_databases]]
binding = "DB"
database_name = "footyfortunes"
database_id = "your-database-id"
```

### Commands

**Run all pending migrations (LOCAL):**
```bash
npm run migrate up
```

**Check migration status:**
```bash
npm run migrate status
```

**Run migrations on PRODUCTION:**
```bash
# Be careful! This affects production database
wrangler d1 execute footyfortunes --file=migrations/001_initial_schema.sql --remote
```

### Manual Migration

If the automated script has issues, you can run migrations manually:

```bash
# Local database
wrangler d1 execute footyfortunes --file=migrations/001_initial_schema.sql --local

# Production database
wrangler d1 execute footyfortunes --file=migrations/001_initial_schema.sql --remote
```

## Creating New Migrations

1. Create a new file with the next sequential number:
   ```
   003_add_new_feature.sql
   ```

2. Add your SQL:
   ```sql
   -- Migration: 003_add_new_feature
   -- Description: Add XYZ feature

   CREATE TABLE IF NOT EXISTS new_table (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     -- columns here
   );
   ```

3. Run the migration:
   ```bash
   npm run migrate up
   ```

## Migration Best Practices

1. **Always use IF NOT EXISTS** for CREATE TABLE statements
2. **Include rollback instructions** in comments
3. **Test migrations locally** before production
4. **Keep migrations small** and focused on one feature
5. **Never modify executed migrations** - create a new one instead
6. **Add indexes** in the same migration as table creation
7. **Use transactions** for complex migrations

## Current Schema Statistics

- **Total Tables:** 82
- **Total Indexes:** 40+
- **Categories:**
  - Core User Management: 4 tables
  - Match Management: 6 tables
  - AI Predictions: 8 tables
  - Gamification: 10 tables
  - Bankroll Management: 9 tables
  - Value Bets & Odds: 7 tables
  - Social Trading: 9 tables
  - Analytics Dashboard: 8 tables
  - AI Assistant: 7 tables
  - Live Features: 6 tables
  - Community: 4 tables
  - Legacy: 3 tables

## Troubleshooting

### "Table already exists" error
This is usually safe to ignore if using `IF NOT EXISTS`. If the error persists:
```bash
# Check existing tables
wrangler d1 execute footyfortunes --command="SELECT name FROM sqlite_master WHERE type='table'" --local
```

### Migration tracking issues
```bash
# Check migration history
wrangler d1 execute footyfortunes --command="SELECT * FROM _migrations" --local

# Manually record a migration (if needed)
wrangler d1 execute footyfortunes --command="INSERT INTO _migrations (name) VALUES ('001_initial_schema')" --local
```

### Reset database (DANGER!)
```bash
# This will DELETE ALL DATA
wrangler d1 execute footyfortunes --command="DROP TABLE IF EXISTS table_name" --local

# Or delete the local .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite file
```

## Notes

- Cloudflare D1 is based on SQLite 3.x
- Migrations run in the order of their filename
- The `_migrations` table tracks executed migrations
- Local database is stored in `.wrangler/state/`
- Production migrations require `--remote` flag
