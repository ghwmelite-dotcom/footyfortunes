# Add Database Table (D1/SQLite)

You are helping to add a new database table to the D1 (SQLite) database.

## Quick Reference

### D1 Table Creation Pattern

```sql
CREATE TABLE table_name (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  field_text TEXT NOT NULL,
  field_number INTEGER DEFAULT 0,
  field_decimal REAL,
  field_bool INTEGER DEFAULT 0, -- SQLite uses 0/1 for booleans
  field_json TEXT, -- Store JSON as TEXT, parse in application
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for frequently queried fields
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_table_created_at ON table_name(created_at);
CREATE INDEX idx_table_status ON table_name(status);

-- Composite index for multiple fields
CREATE INDEX idx_table_user_date ON table_name(user_id, created_at);
```

## SQLite Data Types

1. **TEXT** - String data (VARCHAR, CHAR, TEXT)
2. **INTEGER** - Whole numbers (INT, BIGINT, SMALLINT)
3. **REAL** - Floating point numbers (FLOAT, DOUBLE, DECIMAL)
4. **BLOB** - Binary data (images, files)
5. **TIMESTAMP** - Date/time values (stored as TEXT in ISO 8601 format)

## Common Table Patterns

### User-Related Data Table
```sql
CREATE TABLE user_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  total_bets INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_profit REAL DEFAULT 0.0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_profit ON user_stats(total_profit);
```

### Transactional/Activity Table
```sql
CREATE TABLE user_picks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  pick_type TEXT NOT NULL, -- 'home', 'away', 'draw', 'over', 'under', 'btts'
  odds REAL NOT NULL,
  stake REAL NOT NULL,
  potential_return REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'won', 'lost', 'void'
  profit REAL DEFAULT 0.0,
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_picks_user ON user_picks(user_id);
CREATE INDEX idx_user_picks_match ON user_picks(match_id);
CREATE INDEX idx_user_picks_status ON user_picks(status);
CREATE INDEX idx_user_picks_placed_at ON user_picks(placed_at);
```

### Reference/Lookup Table
```sql
CREATE TABLE leagues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_id INTEGER UNIQUE, -- External API ID
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  season TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leagues_api_id ON leagues(api_id);
CREATE INDEX idx_leagues_country ON leagues(country);
```

### Many-to-Many Relationship Table
```sql
CREATE TABLE user_followed_tipsters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  tipster_id INTEGER NOT NULL,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tipster_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(follower_id, tipster_id) -- Prevent duplicate follows
);

CREATE INDEX idx_user_follows_follower ON user_followed_tipsters(follower_id);
CREATE INDEX idx_user_follows_tipster ON user_followed_tipsters(tipster_id);
```

## Migration Workflow

### 1. Add Schema to schema.sql

Add your CREATE TABLE statement to `worker/schema.sql`:

```sql
-- Add at the end of the file
CREATE TABLE new_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  field TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_table_field ON new_table(field);
```

### 2. Create Migration File

Create a new file in `worker/migrations/` with format: `YYYYMMDD_description.sql`

Example: `worker/migrations/20250115_add_achievements_table.sql`

```sql
-- Migration: Add achievements tracking table
-- Created: 2025-01-15

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
```

### 3. Run Migration

Apply migration to D1 database:

```bash
# Option 1: Run migration script (if available)
cd worker
npm run migrate

# Option 2: Use wrangler CLI directly
wrangler d1 execute footyfortunes-db --file=./migrations/20250115_add_achievements_table.sql

# Option 3: Apply entire schema (for development)
wrangler d1 execute footyfortunes-db --file=./schema.sql
```

### 4. Verify Table Creation

Test with a query:

```bash
wrangler d1 execute footyfortunes-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='achievements';"
```

## Indexing Best Practices

### When to Add Indexes

✅ **DO create indexes for:**
- Foreign key columns (user_id, match_id, etc.)
- Columns frequently used in WHERE clauses
- Columns frequently used in JOIN conditions
- Columns frequently used in ORDER BY
- Columns frequently used in GROUP BY
- Unique constraints

❌ **DON'T create indexes for:**
- Very small tables (<1000 rows)
- Columns rarely queried
- Columns with very few distinct values
- Tables with frequent INSERT/UPDATE operations

### Example: Optimizing Common Queries

If you frequently run:
```sql
SELECT * FROM user_picks WHERE user_id = ? AND status = 'pending' ORDER BY placed_at DESC;
```

Create composite index:
```sql
CREATE INDEX idx_user_picks_user_status_date ON user_picks(user_id, status, placed_at);
```

## Constraints and Validation

### Primary Keys
```sql
-- Auto-incrementing integer (recommended)
id INTEGER PRIMARY KEY AUTOINCREMENT

-- UUID/GUID (if needed for distributed systems)
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))))
```

### Foreign Keys
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (parent_id) REFERENCES same_table(id) ON DELETE SET NULL
```

### Unique Constraints
```sql
-- Single column
email TEXT UNIQUE NOT NULL

-- Multiple columns (composite unique)
UNIQUE(user_id, match_id, pick_type)
```

### Check Constraints
```sql
stake REAL CHECK(stake > 0),
odds REAL CHECK(odds >= 1.0),
status TEXT CHECK(status IN ('pending', 'won', 'lost', 'void'))
```

### Default Values
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
is_active INTEGER DEFAULT 1,
balance REAL DEFAULT 0.0
```

## Workflow

1. **Ask the user what table they want to create**
2. **Determine requirements:**
   - What data will it store?
   - What are the relationships to other tables?
   - What queries will be common?
   - What indexes are needed?
3. **Design the schema:**
   - Choose appropriate data types
   - Add constraints (NOT NULL, UNIQUE, CHECK)
   - Define foreign keys
   - Plan indexes
4. **Add to worker/schema.sql**
5. **Create migration file**
6. **Run migration**
7. **Update handlers to use the new table**
8. **Test queries**

## Testing New Tables

After creating a table, test with these queries:

```sql
-- Verify table structure
PRAGMA table_info(table_name);

-- List all indexes
PRAGMA index_list(table_name);

-- Check index details
PRAGMA index_info(index_name);

-- Insert test data
INSERT INTO table_name (field) VALUES ('test');

-- Query test data
SELECT * FROM table_name;

-- Clean up test data
DELETE FROM table_name WHERE field = 'test';
```

## Common Mistakes to Avoid

❌ **Wrong:** Using VARCHAR instead of TEXT
```sql
name VARCHAR(255) -- Not necessary in SQLite
```
✅ **Correct:** Use TEXT
```sql
name TEXT NOT NULL
```

❌ **Wrong:** No indexes on foreign keys
```sql
user_id INTEGER NOT NULL
```
✅ **Correct:** Always index foreign keys
```sql
user_id INTEGER NOT NULL
CREATE INDEX idx_table_user_id ON table_name(user_id);
```

❌ **Wrong:** Storing booleans as TEXT
```sql
is_active TEXT DEFAULT 'true'
```
✅ **Correct:** Use INTEGER (0/1)
```sql
is_active INTEGER DEFAULT 1
```

Now ask the user about the table they want to create.
