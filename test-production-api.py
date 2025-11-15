#!/usr/bin/env python3
"""Test production API"""
import requests
import json

API_URL = "https://footyfortunes-api.ghwmelite.workers.dev"

print("Testing Production API:", API_URL)
print("=" * 60)

# Test registration with a new user
print("\nTesting Registration...")
response = requests.post(
    f"{API_URL}/api/auth/register",
    json={
        "email": f"prodtest{int(__import__('time').time())}@test.com",
        "password": "TestProd123!@#",
        "username": f"produser{int(__import__('time').time())}",
        "fullName": "Production Test User"
    }
)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Response: {json.dumps(data, indent=2)}")

if response.status_code in [200, 201] and data.get("success"):
    print("\nPASS - Registration successful!")
    print(f"Access Token: {data.get('accessToken')[:50]}...")
else:
    print("\nFAIL - Registration failed")

print("\n" + "=" * 60)
