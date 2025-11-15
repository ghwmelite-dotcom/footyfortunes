#!/usr/bin/env python3
"""
Simple auth test for FootyFortunes API
"""

import requests
import json

API_URL = "http://localhost:8787"

def test_login():
    """Test login with test user"""
    print("\nTesting Login...")
    response = requests.post(
        f"{API_URL}/api/auth/login",
        json={"email": "test@test.com", "password": "Test123!@#"},
        headers={"Content-Type": "application/json"}
    )

    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")

    if response.status_code == 200 and data.get("success"):
        print("PASS Login successful!")
        return data.get("accessToken"), data.get("refreshToken")
    else:
        print("FAIL Login failed")
        return None, None

def test_register():
    """Test registration"""
    import time
    print("\nTesting Registration...")
    response = requests.post(
        f"{API_URL}/api/auth/register",
        json={
            "email": f"newuser{int(time.time())}@test.com",
            "password": "NewUser123!@#",
            "username": f"newuser{int(time.time())}",
            "fullName": "New Test User"
        },
        headers={"Content-Type": "application/json"}
    )

    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")

    if response.status_code in [200, 201] and data.get("success"):
        print("PASS Registration successful!")
        return True
    else:
        print("FAIL Registration failed")
        return False

def test_get_me(access_token):
    """Test get current user"""
    print("\nTesting Get Current User...")
    response = requests.get(
        f"{API_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")

    if response.status_code == 200 and data.get("success"):
        print("PASS Get user info successful!")
        return True
    else:
        print("FAIL Get user info failed")
        return False

if __name__ == "__main__":
    import time

    print("=" * 60)
    print(" FOOTYFORTUNES AUTH TEST")
    print("=" * 60)

    # Test login
    access_token, refresh_token = test_login()

    # Test get me if login successful
    if access_token:
        test_get_me(access_token)

    print("\n" + "=" * 60)
    print(" Tests complete!")
    print("=" * 60)
