#!/usr/bin/env python3
"""Comprehensive auth test with detailed error reporting"""
import requests
import json

print("=" * 80)
print("COMPREHENSIVE FOOTYFORTUNES AUTHENTICATION TEST")
print("=" * 80)

API_URL = "https://footyfortunes-api.ghwmelite.workers.dev"
FRONTEND_URL = "https://897c8a1e.footyfortunes.pages.dev"

# Test 1: Check if frontend is accessible
print("\n1. FRONTEND ACCESSIBILITY TEST")
print("-" * 80)
try:
    r = requests.get(FRONTEND_URL, timeout=10)
    print(f"Frontend Status: {r.status_code}")
    print(f"Frontend Size: {len(r.text)} bytes")
    print(f"Contains 'footyfortunes-api': {'footyfortunes-api' in r.text}")
    if r.status_code != 200:
        print("ERROR: Frontend not accessible!")
except Exception as e:
    print(f"ERROR accessing frontend: {e}")

# Test 2: Check if API is accessible
print("\n2. BACKEND API ACCESSIBILITY TEST")
print("-" * 80)
try:
    r = requests.get(f"{API_URL}/api/picks/today", timeout=10)
    print(f"API Status: {r.status_code}")
    print(f"API Response: {json.dumps(r.json(), indent=2)}")
except Exception as e:
    print(f"ERROR accessing API: {e}")

# Test 3: Test demo login with detailed error info
print("\n3. DEMO LOGIN TEST")
print("-" * 80)
try:
    login_data = {
        "email": "demo@footyfortunes.com",
        "password": "Demo123!@#"
    }
    print(f"Attempting login with: {login_data['email']}")

    r = requests.post(
        f"{API_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"},
        timeout=10
    )

    print(f"Status Code: {r.status_code}")
    print(f"Response Headers: {dict(r.headers)}")
    print(f"Response Body:")
    response_data = r.json()
    print(json.dumps(response_data, indent=2))

    if r.status_code == 200 and response_data.get("success"):
        print("\n✅ LOGIN SUCCESSFUL!")
        print(f"User ID: {response_data.get('user', {}).get('id')}")
        print(f"User Email: {response_data.get('user', {}).get('email')}")
        print(f"Access Token: {response_data.get('accessToken', '')[:50]}...")

        # Test 4: Use the token to get user info
        print("\n4. TESTING TOKEN AUTHENTICATION")
        print("-" * 80)
        token = response_data.get('accessToken')
        me_r = requests.get(
            f"{API_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        print(f"Status Code: {me_r.status_code}")
        print(f"Response:")
        print(json.dumps(me_r.json(), indent=2))
    else:
        print("\n❌ LOGIN FAILED!")
        print(f"Error: {response_data.get('error', 'Unknown error')}")

except Exception as e:
    print(f"ERROR during login test: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Check database directly
print("\n5. DATABASE USER CHECK")
print("-" * 80)
print("To verify user exists in database, run:")
print("cd worker && npx wrangler d1 execute footyfortunes-db --remote --command=\"SELECT email, role FROM users WHERE email='demo@footyfortunes.com';\"")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
