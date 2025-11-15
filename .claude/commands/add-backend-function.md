# Add Backend Function (Cloudflare Workers)

You are helping to add a new backend endpoint/handler to the Cloudflare Workers backend.

## Quick Reference

### Handler Types
1. **Public Handler** - No auth required (GET endpoints, public data)
2. **Protected Handler** - Requires authentication (user-specific data)
3. **Admin Handler** - Requires admin role (admin operations)

### Template Patterns

#### Public Handler Pattern
```javascript
// In worker/src/handlers/yourHandlers.js

export async function handleGetPublicData(request, env) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');

    // Query D1 database
    const result = await env.DB.prepare(
      'SELECT * FROM table_name WHERE field = ?'
    ).bind(param).all();

    return successResponse({
      data: result.results
    });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Failed to fetch data', 500);
  }
}
```

#### Protected Handler Pattern
```javascript
export async function handleProtectedAction(request, env) {
  try {
    // Require authentication
    const user = await requireAuth(request, env);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Parse request body if POST/PUT/PATCH
    const body = await request.json();

    // Validate input
    if (!body.field) {
      return errorResponse('Missing required field', 400);
    }

    // Query with user context
    const result = await env.DB.prepare(
      'INSERT INTO table_name (user_id, field, created_at) VALUES (?, ?, ?)'
    ).bind(user.id, body.field, new Date().toISOString()).run();

    return successResponse({
      id: result.meta.last_row_id,
      message: 'Created successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Failed to create', 500);
  }
}
```

#### Admin Handler Pattern
```javascript
export async function handleAdminAction(request, env) {
  try {
    // Require admin role
    const user = await requireAdmin(request, env);
    if (!user) {
      return errorResponse('Admin access required', 403);
    }

    // Admin-only logic
    const result = await env.DB.prepare(
      'DELETE FROM table_name WHERE id = ?'
    ).bind(id).run();

    return successResponse({
      message: 'Deleted successfully',
      rowsAffected: result.meta.changes
    });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Failed to delete', 500);
  }
}
```

#### External API Call Pattern
```javascript
export async function handleExternalAPICall(request, env) {
  try {
    const user = await requireAuth(request, env);
    if (!user) return errorResponse('Unauthorized', 401);

    // Call external API
    const apiResponse = await fetch('https://api.example.com/data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.EXTERNAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      throw new Error('External API failed');
    }

    const data = await apiResponse.json();

    // Optionally store in D1
    await env.DB.prepare(
      'INSERT INTO cached_data (user_id, data, fetched_at) VALUES (?, ?, ?)'
    ).bind(user.id, JSON.stringify(data), new Date().toISOString()).run();

    return successResponse({ data });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Failed to fetch from external API', 500);
  }
}
```

### Common SQL Patterns

#### SELECT with conditions
```javascript
const result = await env.DB.prepare(
  'SELECT * FROM users WHERE email = ? AND status = ?'
).bind(email, 'active').first(); // .first() for single row, .all() for multiple
```

#### INSERT
```javascript
const result = await env.DB.prepare(
  'INSERT INTO picks (user_id, match_id, selection, stake) VALUES (?, ?, ?, ?)'
).bind(userId, matchId, selection, stake).run();

const newId = result.meta.last_row_id;
```

#### UPDATE
```javascript
await env.DB.prepare(
  'UPDATE users SET last_login = ? WHERE id = ?'
).bind(new Date().toISOString(), userId).run();
```

#### DELETE
```javascript
await env.DB.prepare(
  'DELETE FROM sessions WHERE expires_at < ?'
).bind(new Date().toISOString()).run();
```

#### Aggregation
```javascript
const stats = await env.DB.prepare(`
  SELECT
    COUNT(*) as total_picks,
    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as wins,
    SUM(profit) as total_profit
  FROM user_picks
  WHERE user_id = ?
`).bind(userId).first();
```

### Register Route in index.js

After creating your handler, add it to the router in `worker/src/index.js`:

```javascript
// Import your handler
import { handleYourFunction } from './handlers/yourHandlers.js';

// Add route in the fetch handler
if (url.pathname === '/api/your-endpoint' && request.method === 'GET') {
  return handleYourFunction(request, env);
}

// Or for protected routes
if (url.pathname === '/api/protected-endpoint' && request.method === 'POST') {
  return handleProtectedAction(request, env);
}
```

## Workflow

1. **Ask the user what endpoint/function they want to add**
2. **Determine requirements:**
   - What HTTP method? (GET/POST/PUT/DELETE)
   - Public or protected?
   - What data will it return/accept?
   - Does it need external API calls?
3. **Create handler in appropriate file:**
   - Auth-related → `worker/src/handlers/authHandlers.js`
   - Match-related → `worker/src/handlers/matchHandlers.js`
   - Pick-related → `worker/src/handlers/picksHandlers.js`
   - User pick-related → `worker/src/handlers/userPicksHandlers.js`
   - New domain → Create new handler file
4. **Add route registration in `worker/src/index.js`**
5. **Test with Postman or test script**
6. **Update frontend to consume the endpoint**

## Error Handling Best Practices

```javascript
try {
  // Always validate input
  if (!requiredField) {
    return errorResponse('Missing required field', 400);
  }

  // Always use prepared statements to prevent SQL injection
  const result = await env.DB.prepare(
    'SELECT * FROM table WHERE id = ?'
  ).bind(id).first();

  if (!result) {
    return errorResponse('Not found', 404);
  }

  return successResponse({ data: result });
} catch (error) {
  // Always log errors
  console.error('Function name error:', error);

  // Return user-friendly message
  return errorResponse('Internal server error', 500);
}
```

## Rate Limiting

For sensitive endpoints, consider adding rate limiting:

```javascript
const rateLimitKey = `rate_limit:${user.id}:${endpoint}`;
const limited = await checkRateLimit(env, rateLimitKey, 10, 60); // 10 requests per 60 seconds

if (limited) {
  return errorResponse('Rate limit exceeded', 429);
}
```

Now ask the user about the function they want to create.
