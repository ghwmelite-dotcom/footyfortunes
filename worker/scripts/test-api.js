/**
 * API Test Suite
 * Comprehensive tests for FootyFortunes backend
 */

const API_URL = 'http://localhost:8787'; // Change for production
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

let tokens = {
  accessToken: null,
  refreshToken: null,
  adminAccessToken: null,
  adminRefreshToken: null
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n📋 Test: ${name}`, 'cyan');
  testResults.total++;
}

function logPass(message) {
  log(`  ✅ ${message}`, 'green');
  testResults.passed++;
}

function logFail(message) {
  log(`  ❌ ${message}`, 'red');
  testResults.failed++;
}

function logInfo(message) {
  log(`  ℹ️  ${message}`, 'blue');
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  return { response, data, status: response.status };
}

function assert(condition, passMsg, failMsg) {
  if (condition) {
    logPass(passMsg);
  } else {
    logFail(failMsg);
    throw new Error(failMsg);
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

async function testRegistration() {
  log('\n🔐 === AUTHENTICATION TESTS ===', 'yellow');

  // Test 1: Valid Registration
  logTest('Valid Registration');
  try {
    const { response, data, status } = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `test_${Date.now()}@example.com`,
        password: 'ValidPass123!@#',
        username: `testuser_${Date.now()}`,
        fullName: 'Test User'
      })
    });

    assert(status === 200 || status === 201, 'Registration returned 200/201', `Registration failed with status ${status}`);
    assert(data.success === true, 'Response has success: true', 'Response missing success field');
    assert(data.accessToken, 'Access token returned', 'No access token in response');
    assert(data.refreshToken, 'Refresh token returned', 'No refresh token in response');
    assert(data.user, 'User object returned', 'No user object in response');

    logInfo(`User ID: ${data.user.id}`);
  } catch (error) {
    logFail(`Registration failed: ${error.message}`);
  }

  // Test 2: Invalid Email Format
  logTest('Invalid Email Format');
  try {
    const { data, status } = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'ValidPass123!@#'
      })
    });

    assert(status === 400, 'Returns 400 for invalid email', `Got status ${status}`);
    assert(data.success === false, 'Response has success: false', 'Should fail for invalid email');
    assert(data.validationErrors, 'Has validation errors', 'Missing validation errors');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 3: Weak Password
  logTest('Weak Password Rejection');
  try {
    const { data, status } = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak'
      })
    });

    assert(status === 400, 'Returns 400 for weak password', `Got status ${status}`);
    assert(data.validationErrors, 'Has validation errors', 'Missing validation errors');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 4: Duplicate Email
  logTest('Duplicate Email Prevention');
  try {
    const email = `duplicate_${Date.now()}@example.com`;

    // First registration
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'ValidPass123!@#'
      })
    });

    // Second registration with same email
    const { data, status } = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'ValidPass123!@#'
      })
    });

    assert(status === 409, 'Returns 409 for duplicate email', `Got status ${status}`);
    assert(data.success === false, 'Response has success: false', 'Should fail for duplicate email');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

async function testLogin() {
  log('\n🔑 === LOGIN TESTS ===', 'yellow');

  // Test 1: Valid Login
  logTest('Valid Login with Test User');
  try {
    const { response, data, status } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'Test123!@#'
      })
    });

    assert(status === 200, 'Login returns 200', `Got status ${status}`);
    assert(data.success === true, 'Response has success: true', 'Login should succeed');
    assert(data.accessToken, 'Access token returned', 'No access token');
    assert(data.refreshToken, 'Refresh token returned', 'No refresh token');

    // Store tokens for later tests
    tokens.accessToken = data.accessToken;
    tokens.refreshToken = data.refreshToken;

    logInfo(`Access token: ${data.accessToken.substring(0, 50)}...`);
  } catch (error) {
    logFail(`Login failed: ${error.message}`);
  }

  // Test 2: Admin Login
  logTest('Admin Login');
  try {
    const { data, status } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@footyfortunes.com',
        password: 'Admin123!@#'
      })
    });

    assert(status === 200, 'Admin login returns 200', `Got status ${status}`);
    assert(data.user.role === 'admin', 'User has admin role', `Role is ${data.user.role}`);

    tokens.adminAccessToken = data.accessToken;
    tokens.adminRefreshToken = data.refreshToken;
  } catch (error) {
    logFail(`Admin login failed: ${error.message}`);
  }

  // Test 3: Invalid Password
  logTest('Invalid Password');
  try {
    const { data, status } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'WrongPassword123!@#'
      })
    });

    assert(status === 401, 'Returns 401 for wrong password', `Got status ${status}`);
    assert(data.success === false, 'Response has success: false', 'Should fail with wrong password');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 4: Non-existent User
  logTest('Non-existent User');
  try {
    const { data, status } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!@#'
      })
    });

    assert(status === 401, 'Returns 401 for non-existent user', `Got status ${status}`);
    assert(data.error.includes('Invalid'), 'Generic error message (prevents enumeration)', 'Error message too specific');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

async function testProtectedRoutes() {
  log('\n🔒 === PROTECTED ROUTE TESTS ===', 'yellow');

  // Test 1: Get User Info (Authenticated)
  logTest('Get Current User Info (with token)');
  try {
    const { data, status } = await apiRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`
      }
    });

    assert(status === 200, 'Returns 200 with valid token', `Got status ${status}`);
    assert(data.user, 'User object returned', 'No user object');
    assert(data.user.email === 'test@test.com', 'Correct user returned', `Wrong user: ${data.user.email}`);

    logInfo(`User: ${data.user.email} (ID: ${data.user.id})`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 2: Protected Route Without Token
  logTest('Protected Route Without Token');
  try {
    const { data, status } = await apiRequest('/api/auth/me', {
      method: 'GET'
    });

    assert(status === 401, 'Returns 401 without token', `Got status ${status}`);
    assert(data.success === false, 'Response has success: false', 'Should fail without token');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 3: Invalid Token
  logTest('Invalid Token');
  try {
    const { data, status } = await apiRequest('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid.token.here'
      }
    });

    assert(status === 401, 'Returns 401 with invalid token', `Got status ${status}`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

async function testTokenRefresh() {
  log('\n🔄 === TOKEN REFRESH TESTS ===', 'yellow');

  // Test 1: Valid Refresh Token
  logTest('Refresh Token with Valid Token');
  try {
    const { data, status } = await apiRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: tokens.refreshToken
      })
    });

    assert(status === 200, 'Returns 200 for valid refresh', `Got status ${status}`);
    assert(data.accessToken, 'New access token returned', 'No access token');
    assert(data.accessToken !== tokens.accessToken, 'New token is different', 'Token should be refreshed');

    // Update stored token
    tokens.accessToken = data.accessToken;

    logInfo(`New access token: ${data.accessToken.substring(0, 50)}...`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 2: Invalid Refresh Token
  logTest('Invalid Refresh Token');
  try {
    const { data, status } = await apiRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: 'invalid.refresh.token'
      })
    });

    assert(status === 401, 'Returns 401 for invalid token', `Got status ${status}`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

async function testAdminRoutes() {
  log('\n👑 === ADMIN ROUTE TESTS ===', 'yellow');

  // Test 1: Admin Stats (with admin token)
  logTest('Admin Stats (with admin token)');
  try {
    const { data, status } = await apiRequest('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.adminAccessToken}`
      }
    });

    assert(status === 200, 'Returns 200 with admin token', `Got status ${status}`);
    assert(data.stats, 'Stats object returned', 'No stats object');
    assert(typeof data.stats.totalUsers === 'number', 'Has totalUsers', 'Missing totalUsers');

    logInfo(`Total Users: ${data.stats.totalUsers}`);
    logInfo(`Total Picks: ${data.stats.totalPicks}`);
    logInfo(`Win Rate: ${data.stats.winRate}%`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 2: Admin Route with User Token
  logTest('Admin Route with User Token (should fail)');
  try {
    const { data, status } = await apiRequest('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}` // Regular user token
      }
    });

    assert(status === 403, 'Returns 403 for non-admin', `Got status ${status}`);
    assert(data.success === false, 'Access denied', 'Should deny non-admin access');
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 3: Get All Users (admin only)
  logTest('Get All Users (admin)');
  try {
    const { data, status } = await apiRequest('/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.adminAccessToken}`
      }
    });

    assert(status === 200, 'Returns 200', `Got status ${status}`);
    assert(Array.isArray(data.users), 'Users array returned', 'No users array');
    assert(data.users.length > 0, 'Has users', 'No users in database');

    logInfo(`Total users in DB: ${data.users.length}`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

async function testPublicRoutes() {
  log('\n🌍 === PUBLIC ROUTE TESTS ===', 'yellow');

  // Test 1: Get Today's Picks
  logTest('Get Today\'s Picks (public)');
  try {
    const { data, status } = await apiRequest('/api/picks/today', {
      method: 'GET'
    });

    assert(status === 200, 'Returns 200', `Got status ${status}`);
    assert(data.success !== undefined, 'Has success field', 'Missing success field');

    if (data.picks) {
      logInfo(`Today's picks available`);
    } else {
      logInfo('No picks for today (expected if none generated)');
    }
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }

  // Test 2: Get Archive
  logTest('Get Picks Archive (public)');
  try {
    const { data, status } = await apiRequest('/api/picks/archive?limit=10', {
      method: 'GET'
    });

    assert(status === 200, 'Returns 200', `Got status ${status}`);
    assert(data.stats, 'Stats object returned', 'No stats object');
    assert(Array.isArray(data.picks), 'Picks array returned', 'No picks array');

    logInfo(`Archive picks: ${data.picks.length}`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

async function testRateLimiting() {
  log('\n⏱️  === RATE LIMITING TESTS ===', 'yellow');

  logTest('Rate Limiting on Auth Endpoints');
  try {
    const attempts = [];

    // Make 6 failed login attempts (limit is 5 per 15 min)
    for (let i = 0; i < 6; i++) {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'ratelimit@test.com',
          password: 'Wrong123!@#'
        })
      });

      attempts.push(result);

      if (i < 5) {
        logInfo(`Attempt ${i + 1}: ${result.status} (should be 401)`);
      }
    }

    const lastAttempt = attempts[attempts.length - 1];

    assert(lastAttempt.status === 429, '6th attempt returns 429', `Got status ${lastAttempt.status}`);
    assert(lastAttempt.data.retryAfter, 'Has retryAfter field', 'Missing retryAfter');

    logInfo(`Rate limited! Retry after: ${lastAttempt.data.retryAfter}s`);
  } catch (error) {
    logFail(`Test failed: ${error.message}`);
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         FOOTYFORTUNES API TEST SUITE                      ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n📡 Testing API: ${API_URL}\n`, 'blue');

  try {
    await testRegistration();
    await testLogin();
    await testProtectedRoutes();
    await testTokenRefresh();
    await testAdminRoutes();
    await testPublicRoutes();
    await testRateLimiting();

    // Summary
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║                     TEST SUMMARY                           ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);

    log(`\n📊 Total Tests: ${testResults.total}`, 'blue');
    log(`✅ Passed: ${testResults.passed}`, 'green');
    log(`❌ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    log(`📈 Pass Rate: ${passRate}%`, passRate === '100.0' ? 'green' : 'yellow');

    if (testResults.failed === 0) {
      log('\n🎉 ALL TESTS PASSED! Backend is working correctly!', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please review the errors above.', 'red');
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ Fatal error during testing: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
