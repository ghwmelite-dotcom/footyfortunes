/**
 * Test script for picks generation
 */

const API_BASE = 'http://localhost:8787';

async function testGeneratePicks() {
  try {
    console.log('🔐 Step 1: Logging in as admin...');

    // Login as admin
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@footyfortunes.com',
        password: 'Admin123!@#'
      })
    });

    const loginData = await loginResponse.json();

    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success || !loginData.data?.token) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');

    console.log('\n🎲 Step 2: Generating picks...');

    // Generate picks
    const generateResponse = await fetch(`${API_BASE}/api/admin/generate-picks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const generateData = await generateResponse.json();

    console.log('\n📊 Generate Picks Response:');
    console.log(JSON.stringify(generateData, null, 2));

    if (!generateData.success) {
      console.error('\n❌ Picks generation failed!');
      return;
    }

    console.log('\n✅ Picks generated successfully!');

    console.log('\n🎯 Step 3: Fetching today\'s picks...');

    // Fetch today's picks
    const picksResponse = await fetch(`${API_BASE}/api/picks/today`);
    const picksData = await picksResponse.json();

    console.log('\n📊 Today\'s Picks:');
    console.log(JSON.stringify(picksData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testGeneratePicks();
