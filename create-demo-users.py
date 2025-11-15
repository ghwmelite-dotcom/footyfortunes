#!/usr/bin/env python3
"""Create demo users with proper bcrypt hashes"""
import requests
import json

API_URL = "https://footyfortunes-api.ghwmelite.workers.dev"

print("Creating Demo Users...")
print("=" * 60)

# Create demo user
print("\n1. Creating Demo User...")
response = requests.post(
    f"{API_URL}/api/auth/register",
    json={
        "email": "demo@footyfortunes.com",
        "password": "Demo123!@#",
        "username": "demouser",
        "fullName": "Demo User"
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Create test user
print("\n2. Creating Test User...")
response = requests.post(
    f"{API_URL}/api/auth/register",
    json={
        "email": "test@test.com",
        "password": "Test123!@#",
        "username": "testuser",
        "fullName": "Test User"
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

print("\n" + "=" * 60)
print("Demo users created successfully!")
print("\nLogin Credentials:")
print("1. Email: demo@footyfortunes.com | Password: Demo123!@#")
print("2. Email: test@test.com | Password: Test123!@#")
