/**
 * Quick script to sync live match data
 * Run this to update ongoing match scores
 */

const API_URL = 'https://footyfortunes-api.ghwmelite.workers.dev';

async function syncLiveMatches() {
  try {
    // Step 1: Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@footyfortunes.com',
        password: 'Admin123!@#'
      })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const accessToken = loginData.accessToken;
    console.log('✅ Logged in successfully');

    // Step 2: Sync live matches
    console.log('⚽ Syncing live matches...');
    const syncResponse = await fetch(`${API_URL}/api/admin/sync/live`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const syncData = await syncResponse.json();

    if (syncData.success) {
      console.log('✅ Live matches synced successfully!');
      console.log(`   📊 Synced: ${syncData.message?.synced || 0} matches`);
      console.log(`   ⚠️ Errors: ${syncData.message?.errors || 0}`);
      console.log(`   📈 Total: ${syncData.message?.total || 0}`);
    } else {
      console.error('❌ Sync failed:', syncData.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run it
syncLiveMatches();
