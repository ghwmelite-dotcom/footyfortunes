/**
 * Quick integration test for frontend-backend connection
 */

const API_URL = 'http://localhost:8787';

async function testIntegration() {
  console.log('🧪 Testing FootyFortunes Integration\n');

  // Test 1: Public endpoint (today's picks)
  console.log('Test 1: Fetching today\'s picks (public)...');
  try {
    const response = await fetch(`${API_URL}/api/picks/today`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`   Response: ${data.success ? 'Success' : 'Failed'}`);
    if (data.picks) {
      console.log(`   Picks: ${data.picks.matches?.length || 0} matches`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Login with demo credentials
  console.log('Test 2: Login with demo credentials...');
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'Test123!@#'
      })
    });
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`   Response: ${data.success ? 'Success' : 'Failed'}`);
    if (data.user) {
      console.log(`   User: ${data.user.email} (${data.user.role})`);
    }
    if (data.error) {
      console.log(`   Error: ${data.error}`);
    }

    // Save token for next test
    if (data.success && data.accessToken) {
      global.testToken = data.accessToken;
      console.log(`   Token received: ${data.accessToken.substring(0, 20)}...`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Protected endpoint (get current user)
  if (global.testToken) {
    console.log('Test 3: Fetching current user (protected)...');
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${global.testToken}` }
      });
      const data = await response.json();
      console.log(`✅ Status: ${response.status}`);
      console.log(`   Response: ${data.success ? 'Success' : 'Failed'}`);
      if (data.user) {
        console.log(`   User: ${data.user.email} (${data.user.role})`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Integration test complete!');
}

testIntegration().catch(console.error);
