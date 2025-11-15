#!/usr/bin/env python3
"""Test demo login"""
import requests
import json

API_URL = "https://footyfortunes-api.ghwmelite.workers.dev"

print("Testing Demo Login...")
print("=" * 60)

# Test login with demo credentials
response = requests.post(
    f"{API_URL}/api/auth/login",
    json={
        "email": "demo@footyfortunes.com",
        "password": "Demo123!@#"
    }
)

print(f"Status: {response.status_code}")
data = response.json()
print(f"Response: {json.dumps(data, indent=2)}")

if response.status_code == 200 and data.get("success"):
    print("\n✅ LOGIN SUCCESSFUL!")
    print(f"User ID: {data['user']['id']}")
    print(f"Email: {data['user']['email']}")
    print(f"Role: {data['user']['role']}")

    # Test getting user info
    access_token = data.get("accessToken")
    print("\n\nTesting /api/auth/me endpoint...")
    me_response = requests.get(
        f"{API_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    print(f"Status: {me_response.status_code}")
    me_data = me_response.json()
    print(f"User Data: {json.dumps(me_data, indent=2)}")
else:
    print("\n❌ LOGIN FAILED!")
    print(f"Error: {data.get('error')}")

print("\n" + "=" * 60)
