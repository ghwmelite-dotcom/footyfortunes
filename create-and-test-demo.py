#!/usr/bin/env python3
"""Create demo user and immediately test it"""
import requests
import json
import time

API_URL = "https://footyfortunes-api.ghwmelite.workers.dev"

print("Creating fresh demo user...")
print("=" * 70)

# Register with EXACT credentials we'll use for login
demo_email = "demo@footyfortunes.com"
demo_password = "Demo123!@#"

reg_response = requests.post(
    f"{API_URL}/api/auth/register",
    json={
        "email": demo_email,
        "password": demo_password,
        "username": "demouser",
        "fullName": "Demo User"
    }
)

print(f"Registration Status: {reg_response.status_code}")
reg_data = reg_response.json()

if reg_response.status_code in [200, 201] and reg_data.get("success"):
    print(f"SUCCESS - User ID: {reg_data.get('user', {}).get('id')}")
    print(f"\nWaiting 2 seconds...")
    time.sleep(2)

    # NOW TEST IMMEDIATELY with exact same credentials
    print("\nTesting login with SAME credentials...")
    print("-" * 70)

    login_response = requests.post(
        f"{API_URL}/api/auth/login",
        json={
            "email": demo_email,
            "password": demo_password
        }
    )

    print(f"Login Status: {login_response.status_code}")
    login_data = login_response.json()

    if login_response.status_code == 200 and login_data.get("success"):
        print("\n*** SUCCESS! LOGIN WORKS! ***")
        print(f"Email: {demo_email}")
        print(f"Password: {demo_password}")
        print(f"User ID: {login_data.get('user', {}).get('id')}")
        print(f"\nThese credentials are NOW VERIFIED WORKING!")
    else:
        print(f"\nFAILED! Status: {login_response.status_code}")
        print(f"Error: {login_data.get('error')}")
        print(f"Full response: {json.dumps(login_data, indent=2)}")
        exit(1)
else:
    print(f"Registration failed: {reg_data.get('error')}")
    print(f"Full response: {json.dumps(reg_data, indent=2)}")
    exit(1)
