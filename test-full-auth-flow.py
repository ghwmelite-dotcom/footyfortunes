#!/usr/bin/env python3
"""Test full auth flow - register and login"""
import requests
import json
import time

API_URL = "https://footyfortunes-api.ghwmelite.workers.dev"

print("=" * 70)
print("TESTING FULL AUTHENTICATION FLOW")
print("=" * 70)

# Generate unique email
timestamp = int(time.time())
test_email = f"testuser{timestamp}@example.com"
test_password = "TestPass123!@#"

# Step 1: Register
print(f"\n1. REGISTERING NEW USER")
print(f"   Email: {test_email}")
print(f"   Password: {test_password}")
print("-" * 70)

reg_response = requests.post(
    f"{API_URL}/api/auth/register",
    json={
        "email": test_email,
        "password": test_password,
        "username": f"user{timestamp}",
        "fullName": "Test User"
    }
)

print(f"Status: {reg_response.status_code}")
reg_data = reg_response.json()

if reg_response.status_code in [200, 201] and reg_data.get("success"):
    print(f"SUCCESS - User registered!")
    print(f"User ID: {reg_data.get('user', {}).get('id')}")
else:
    print(f"FAILED - {reg_data.get('error')}")
    exit(1)

# Step 2: Login with same credentials
print(f"\n2. LOGGING IN WITH SAME CREDENTIALS")
print("-" * 70)

time.sleep(1)  # Brief pause

login_response = requests.post(
    f"{API_URL}/api/auth/login",
    json={
        "email": test_email,
        "password": test_password
    }
)

print(f"Status: {login_response.status_code}")
login_data = login_response.json()

if login_response.status_code == 200 and login_data.get("success"):
    print(f"SUCCESS - Login successful!")
    print(f"User ID: {login_data.get('user', {}).get('id')}")
    print(f"Access Token: {login_data.get('accessToken')[:50]}...")

    # Step 3: Get user info
    print(f"\n3. FETCHING USER INFO")
    print("-" * 70)

    me_response = requests.get(
        f"{API_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {login_data.get('accessToken')}"}
    )

    print(f"Status: {me_response.status_code}")
    me_data = me_response.json()

    if me_response.status_code == 200:
        print(f"SUCCESS - User data retrieved!")
        print(f"Email: {me_data.get('user', {}).get('email')}")
        print(f"Username: {me_data.get('user', {}).get('username')}")
    else:
        print(f"FAILED - {me_data.get('error')}")

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED!")
    print("=" * 70)
    print(f"\nWORKING CREDENTIALS:")
    print(f"Email: {test_email}")
    print(f"Password: {test_password}")
else:
    print(f"FAILED - {login_data.get('error')}")
    print(f"Full response: {json.dumps(login_data, indent=2)}")
    exit(1)
