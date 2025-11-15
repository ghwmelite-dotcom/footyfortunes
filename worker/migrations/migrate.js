/**
 * D1 Migration Runner for Cloudflare Workers
 *
 * Usage:
 *   npm run migrate up    - Run all pending migrations
 *   npm run migrate down  - Rollback last migration
 *   npm run migrate reset - Reset database (DANGEROUS!)
 *
 * Environment:
 *   Requires wrangler.toml configured with D1 binding
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration tracking table
const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  executed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/**
 * Get all migration files from the migrations directory
 */
function getMigrationFiles() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && f !== 'schema.sql')
    .sort();

  return files.map(file => ({
    name: file.replace('.sql', ''),
    path: path.join(migrationsDir, file),
    sql: fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  }));
}

/**
 * Run migrations via wrangler d1 execute
 */
async function runMigration(migrationFile, databaseId) {
  console.log(`\n📦 Running migration: ${migrationFile.name}`);

  // Create temporary file for migration
  const tempFile = path.join(__dirname, '.temp-migration.sql');
  fs.writeFileSync(tempFile, migrationFile.sql);

  try {
    // Execute via wrangler
    const { execSync } = await import('child_process');
    const command = `wrangler d1 execute ${databaseId} --file="${tempFile}" --local`;

    execSync(command, { stdio: 'inherit' });

    // Record migration
    const recordSql = `INSERT INTO _migrations (name) VALUES ('${migrationFile.name}');`;
    fs.writeFileSync(tempFile, recordSql);
    execSync(`wrangler d1 execute ${databaseId} --file="${tempFile}" --local`, { stdio: 'inherit' });

    console.log(`✅ Migration ${migrationFile.name} completed`);
  } catch (error) {
    console.error(`❌ Migration ${migrationFile.name} failed:`, error.message);
    throw error;
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

/**
 * Get database ID from wrangler.toml
 */
function getDatabaseId() {
  const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
  const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');

  // Parse database_id from wrangler.toml
  const match = wranglerContent.match(/database_id\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error('Could not find database_id in wrangler.toml');
  }

  return match[1];
}

/**
 * Initialize migration system
 */
async function initMigrations(databaseId) {
  console.log('🔧 Initializing migration system...');

  const tempFile = path.join(__dirname, '.temp-migration.sql');
  fs.writeFileSync(tempFile, MIGRATIONS_TABLE);

  try {
    const { execSync } = await import('child_process');
    execSync(`wrangler d1 execute ${databaseId} --file="${tempFile}" --local`, { stdio: 'inherit' });
    console.log('✅ Migration system initialized');
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

/**
 * Get executed migrations
 */
async function getExecutedMigrations(databaseId) {
  try {
    const { execSync } = await import('child_process');
    const result = execSync(
      `wrangler d1 execute ${databaseId} --command="SELECT name FROM _migrations ORDER BY id" --local`,
      { encoding: 'utf-8' }
    );

    // Parse output (wrangler returns JSON)
    const lines = result.split('\n').filter(l => l.trim());
    const executed = [];

    for (const line of lines) {
      if (line.includes('│') && !line.includes('name')) {
        const name = line.split('│')[1]?.trim();
        if (name) executed.push(name);
      }
    }

    return executed;
  } catch (error) {
    return [];
  }
}

/**
 * Main migration command
 */
async function main() {
  const command = process.argv[2] || 'up';
  const databaseId = getDatabaseId();

  console.log(`\n🚀 FootyFortunes Database Migration Tool`);
  console.log(`📊 Database: ${databaseId}`);
  console.log(`⚡ Command: ${command}\n`);

  // Initialize migration tracking
  await initMigrations(databaseId);

  const allMigrations = getMigrationFiles();
  const executedMigrations = await getExecutedMigrations(databaseId);

  console.log(`📋 Total migrations: ${allMigrations.length}`);
  console.log(`✓ Executed: ${executedMigrations.length}`);

  if (command === 'up') {
    // Run pending migrations
    const pending = allMigrations.filter(m => !executedMigrations.includes(m.name));

    if (pending.length === 0) {
      console.log('\n✅ No pending migrations. Database is up to date!');
      return;
    }

    console.log(`\n📦 Pending migrations: ${pending.length}\n`);

    for (const migration of pending) {
      await runMigration(migration, databaseId);
    }

    console.log('\n🎉 All migrations completed successfully!');

  } else if (command === 'status') {
    // Show migration status
    console.log('\n📊 Migration Status:\n');

    for (const migration of allMigrations) {
      const isExecuted = executedMigrations.includes(migration.name);
      console.log(`${isExecuted ? '✅' : '⏳'} ${migration.name}`);
    }

  } else if (command === 'reset') {
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA!');
    console.log('This operation cannot be undone.\n');

    // In production, you'd want confirmation here
    console.log('To reset, manually run: wrangler d1 execute DB_NAME --command="DROP TABLE table_name" for each table');

  } else {
    console.log('\n❌ Unknown command. Available commands:');
    console.log('  up      - Run pending migrations');
    console.log('  status  - Show migration status');
    console.log('  reset   - Reset database (manual)');
  }
}

// Run
main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
