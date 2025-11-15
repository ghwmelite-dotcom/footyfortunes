/**
 * Test bet placement specifically
 */

const API_URL = 'https://footyfortunes-api.ghwmelite.workers.dev';
const DEMO_EMAIL = 'demo@footyfortunes.com';
const DEMO_PASSWORD = 'Demo123!@#';

async function testBetPlacement() {
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginData.accessToken;

    // Step 2: Get predictions
    console.log('\n2. Getting predictions...');
    const predsRes = await fetch(`${API_URL}/api/predictions/today`);
    const predsData = await predsRes.json();
    
    if (!predsData.success || !predsData.message?.predictions?.[0]) {
      console.error('❌ No predictions available');
      return;
    }
    
    const prediction = predsData.message.predictions[0];
    console.log('✅ Found prediction:', prediction.id);
    console.log('   Match:', prediction.home_team_name, 'vs', prediction.away_team_name);

    // Step 3: Check stats before
    console.log('\n3. Checking stats before...');
    const statsBeforeRes = await fetch(`${API_URL}/api/user/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsBefore = await statsBeforeRes.json();
    console.log('Stats response:', JSON.stringify(statsBefore, null, 2));

    // Step 4: Place bet
    console.log('\n4. Placing bet...');
    const betRes = await fetch(`${API_URL}/api/user/picks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prediction_id: prediction.id,
        stake_amount: 10,
        notes: 'Test bet'
      })
    });
    
    const betData = await betRes.json();
    console.log('Bet response status:', betRes.status);
    console.log('Bet response:', JSON.stringify(betData, null, 2));
    
    if (betData.success) {
      console.log('✅ Bet placed successfully!');
      console.log('   New bankroll:', betData.new_bankroll);
    } else {
      console.log('❌ Bet failed:', betData.error);
    }

    // Step 5: Check stats after
    console.log('\n5. Checking stats after...');
    const statsAfterRes = await fetch(`${API_URL}/api/user/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsAfter = await statsAfterRes.json();
    
    if (statsAfter.success) {
      console.log('✅ Stats updated:');
      console.log('   Total picks:', statsAfter.stats?.total_picks);
      console.log('   Bankroll:', statsAfter.stats?.current_bankroll);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBetPlacement();

