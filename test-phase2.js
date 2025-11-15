/**
 * Phase 2 Testing Script
 * Test user picks, stats, and gamification features
 */

const API_URL = 'https://footyfortunes-api.ghwmelite.workers.dev';

// Test credentials
const ADMIN_EMAIL = 'admin@footyfortunes.com';
const ADMIN_PASSWORD = 'Admin123!@#';
const DEMO_EMAIL = 'demo@footyfortunes.com';
const DEMO_PASSWORD = 'Demo123!@#';

let adminToken = '';
let demoToken = '';

// Utility function for API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Step 1: Login as admin
async function loginAdmin() {
  console.log('\n📝 Step 1: Logging in as admin...');
  const result = await apiCall('/api/auth/login', 'POST', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (result.data.success && result.data.accessToken) {
    adminToken = result.data.accessToken;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.error('❌ Admin login failed:', result.data.error);
    return false;
  }
}

// Step 2: Sync today's matches
async function syncMatches() {
  console.log('\n🔄 Step 2: Syncing today\'s matches...');
  const result = await apiCall('/api/admin/sync/today', 'POST', {}, adminToken);
  
  if (result.data.success) {
    console.log('✅ Matches synced:', result.data.message?.count || 0, 'matches');
    return true;
  } else {
    console.error('⚠️ Sync info:', result.data.message || result.data.error);
    return true; // Continue even if no new matches
  }
}

// Step 3: Generate predictions
async function generatePredictions() {
  console.log('\n🤖 Step 3: Generating AI predictions...');
  const result = await apiCall('/api/admin/generate-predictions', 'POST', {}, adminToken);
  
  if (result.data.success) {
    console.log('✅ Predictions generated:', result.data.message?.generated || 0, 'predictions');
    console.log('   Value bets found:', result.data.message?.value_bets || 0);
    return true;
  } else {
    console.error('❌ Failed to generate predictions:', result.data.error);
    return false;
  }
}

// Step 4: Verify predictions exist
async function checkPredictions() {
  console.log('\n🔍 Step 4: Checking predictions...');
  const result = await apiCall('/api/predictions/today', 'GET');
  
  if (result.data.success) {
    const count = result.data.message?.count || 0;
    console.log(`✅ Found ${count} predictions for today`);
    
    if (count > 0) {
      const sample = result.data.message.predictions[0];
      console.log('\n📋 Sample prediction:');
      console.log(`   Match: ${sample.home_team_name} vs ${sample.away_team_name}`);
      console.log(`   League: ${sample.league_name}`);
      console.log(`   Prediction: ${sample.predicted_winner}`);
      console.log(`   Confidence: ${sample.confidence}%`);
      return sample.id;
    }
    return null;
  } else {
    console.error('❌ Failed to fetch predictions:', result.data.error);
    return null;
  }
}

// Step 5: Login as demo user
async function loginDemo() {
  console.log('\n👤 Step 5: Logging in as demo user...');
  const result = await apiCall('/api/auth/login', 'POST', {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD
  });

  if (result.data.success && result.data.accessToken) {
    demoToken = result.data.accessToken;
    console.log('✅ Demo user login successful');
    return true;
  } else {
    console.error('❌ Demo login failed:', result.data.error);
    return false;
  }
}

// Step 6: Check demo user stats (before)
async function checkStatsBefore() {
  console.log('\n📊 Step 6: Checking demo user stats (BEFORE)...');
  const result = await apiCall('/api/user/stats', 'GET', null, demoToken);
  
  if (result.data.success) {
    const stats = result.data.stats;
    console.log('✅ Current stats:');
    console.log(`   Total picks: ${stats.total_picks || 0}`);
    console.log(`   Win rate: ${stats.win_rate || 0}%`);
    console.log(`   Net profit: GH₵${stats.net_profit || 0}`);
    console.log(`   Current bankroll: GH₵${stats.current_bankroll || 1000}`);
    console.log(`   Achievements unlocked: ${result.data.achievements_unlocked || 0}`);
    return stats;
  } else {
    console.error('⚠️ Could not fetch stats');
    return null;
  }
}

// Step 7: Place a bet
async function placeBet(predictionId) {
  console.log('\n💰 Step 7: Placing a bet...');
  const result = await apiCall('/api/user/picks', 'POST', {
    prediction_id: predictionId,
    stake_amount: 10,
    notes: 'Test bet from Phase 2 testing'
  }, demoToken);
  
  if (result.data.success) {
    console.log('✅ Bet placed successfully!');
    console.log(`   Stake: GH₵10`);
    console.log(`   New bankroll: GH₵${result.data.new_bankroll}`);
    return true;
  } else {
    console.error('❌ Failed to place bet:', result.data.error);
    return false;
  }
}

// Step 8: Check stats after
async function checkStatsAfter() {
  console.log('\n📊 Step 8: Checking demo user stats (AFTER)...');
  const result = await apiCall('/api/user/stats', 'GET', null, demoToken);
  
  if (result.data.success) {
    const stats = result.data.stats;
    const level = result.data.level;
    console.log('✅ Updated stats:');
    console.log(`   Total picks: ${stats.total_picks || 0} (should be +1)`);
    console.log(`   Pending picks: ${stats.pending_picks || 0}`);
    console.log(`   Current bankroll: GH₵${stats.current_bankroll || 0}`);
    console.log(`   Level: ${level.current_level || 1}`);
    console.log(`   XP: ${level.current_xp}/${level.next_level_xp}`);
    console.log(`   Achievements unlocked: ${result.data.achievements_unlocked || 0}`);
    return true;
  } else {
    console.error('⚠️ Could not fetch updated stats');
    return false;
  }
}

// Step 9: Check achievements
async function checkAchievements() {
  console.log('\n🏆 Step 9: Checking achievements...');
  const result = await apiCall('/api/user/achievements', 'GET', null, demoToken);
  
  if (result.data.success) {
    const unlocked = result.data.achievements.filter(a => a.is_completed);
    console.log(`✅ Found ${unlocked.length} unlocked achievements:`);
    
    unlocked.slice(0, 5).forEach(achievement => {
      console.log(`   🎖️  ${achievement.name} (${achievement.rarity})`);
      console.log(`       ${achievement.description}`);
      console.log(`       XP Reward: +${achievement.xp_reward}`);
    });
    
    if (unlocked.length > 5) {
      console.log(`   ... and ${unlocked.length - 5} more!`);
    }
    return true;
  } else {
    console.error('⚠️ Could not fetch achievements');
    return false;
  }
}

// Step 10: Check leaderboard
async function checkLeaderboard() {
  console.log('\n🏅 Step 10: Checking leaderboard...');
  const result = await apiCall('/api/leaderboard?period=all_time&limit=10', 'GET');
  
  if (result.data.success) {
    const board = result.data.leaderboard;
    console.log(`✅ Top ${board.length} players:`);
    
    board.forEach((entry, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`   ${emoji} #${entry.rank} ${entry.username || entry.full_name || 'Player'}`);
      console.log(`       Picks: ${entry.total_picks} | Win Rate: ${entry.win_rate?.toFixed(1)}%`);
      console.log(`       ROI: ${entry.roi_percentage?.toFixed(1)}% | Profit: GH₵${entry.net_profit?.toFixed(2)}`);
    });
    return true;
  } else {
    console.error('⚠️ Could not fetch leaderboard');
    return false;
  }
}

// Main test flow
async function runTests() {
  console.log('🚀 FootyFortunes Phase 2 Testing\n');
  console.log('Testing URL:', API_URL);
  console.log('=' .repeat(60));

  // Admin setup
  if (!await loginAdmin()) return;
  await syncMatches();
  if (!await generatePredictions()) return;
  
  const predictionId = await checkPredictions();
  if (!predictionId) {
    console.log('\n⚠️  No predictions available for testing.');
    console.log('This might mean:');
    console.log('  - No matches scheduled for today');
    console.log('  - API-Football returned no data');
    console.log('  - Try again tomorrow or check API-Football status');
    return;
  }

  // Demo user testing
  if (!await loginDemo()) return;
  await checkStatsBefore();
  await placeBet(predictionId);
  await checkStatsAfter();
  await checkAchievements();
  await checkLeaderboard();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('\n🌐 Now visit the frontend to see it in action:');
  console.log('   https://773aba70.footyfortunes.pages.dev');
  console.log('\n👤 Login with:');
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log('\n💡 What to do next:');
  console.log('   1. Check your stats on the Dashboard');
  console.log('   2. Go to Picks page and place more bets');
  console.log('   3. View your achievements');
  console.log('   4. Check the Leaderboard');
}

// Run the tests
runTests().catch(console.error);

