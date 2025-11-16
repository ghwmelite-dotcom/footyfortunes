# Authentication Testing Guide

## Quick Test - Check if Auth Works

### Step 1: Get Your Token
1. Login to https://footyfortunes.pages.dev
2. Open Console (F12)
3. Run: `localStorage.getItem('token')`
4. Copy the token value

### Step 2: Test API Directly
Open a new browser tab and visit:
```
https://footyfortunes-api.ghwmelite.workers.dev/api/auth/me
```

Add header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Expected Results:

**If Working:**
```json
{
  "success": true,
  "user": {
    "id": 8,
    "email": "test@test.com",
    "username": "testuser",
    ...
  }
}
```

**If Failing:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

## Quick Fix Options

### Option 1: Fresh Login
1. Logout completely
2. Clear browser cache (Ctrl + Shift + Delete)
3. Login again
4. New token generated

### Option 2: Check Token Storage
Run in console:
```javascript
// Check token exists
console.log('Token:', localStorage.getItem('token'));

// Check token structure  
console.log('Token parts:', localStorage.getItem('token')?.split('.').length); // Should be 3

// Decode token payload (without verification)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
}
```

### Option 3: Re-generate Picks
If logged in but no picks showing:
1. Go to Admin page (if admin)
2. Click "Generate Predictions"
3. Select leagues
4. Click "Generate"
5. Check dashboard again

## Common Issues

**401 Unauthorized:**
- Token expired or invalid
- Solution: Logout and login again

**500 Server Error:**
- Backend issue
- Check worker logs
- Solution: Report error message

**Picks not showing:**
- No predictions generated today
- Solution: Admin → Generate Predictions

**Dashboard stuck loading:**
- Auth failing (401 errors)
- Solution: Fresh login with cache cleared
