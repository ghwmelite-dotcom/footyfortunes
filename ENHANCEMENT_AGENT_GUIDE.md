# FootyFortunes Enhancement Agent Guide

**Created:** November 15, 2025
**Project:** FootyFortunes - AI Football Betting Platform

---

## Overview

This guide explains the enhancement agent system configured for the FootyFortunes project. The agent system provides slash commands and code templates to accelerate development across all facets of the platform.

---

## Project Architecture

### Technology Stack

**Frontend:**
- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- Zustand for state management
- React Router DOM for routing

**Backend:**
- Cloudflare Workers (serverless)
- D1 Database (SQLite-based)
- JWT authentication with bcrypt
- Rate limiting and CORS handling

**AI Integration:**
- Cloudflare AI Workers (@cf/meta/llama-3-8b-instruct)
- OpenAI GPT (optional for premium predictions)

**Deployment:**
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers
- CI/CD: GitHub integration (auto-deploy on push)

---

## Enhancement Agent Configuration

All agent configuration is located in `.claude/` directory:

```
.claude/
├── enhancement-agent-config.json   # Project patterns and conventions
├── settings.local.json              # Claude Code permissions
└── commands/                        # Slash commands
    ├── new-feature.md               # Complete feature workflow
    ├── add-backend-function.md      # Add API endpoint/handler
    ├── add-component.md             # Add React component
    ├── add-table.md                 # Add D1 database table
    ├── review-code.md               # Code review checklist
    └── optimize-feature.md          # Performance optimization
```

---

## Available Slash Commands

### 1. `/new-feature` - Complete Feature Workflow

Use when: Adding a brand new feature to the platform

**What it does:**
- Guides you through the full feature implementation process
- Updates database schema (D1)
- Creates backend handlers (Cloudflare Workers)
- Creates frontend components (React + TypeScript)
- Updates routing and navigation
- Tests functionality end-to-end

**Example:**
```
User: /new-feature
Agent: What feature would you like to add?
User: I want to add a prediction history page where users can see all their past predictions with win/loss stats
```

---

### 2. `/add-backend-function` - Add API Endpoint

Use when: Adding a new API endpoint or handler function

**What it does:**
- Asks about endpoint requirements (GET/POST/PUT/DELETE)
- Determines if it's public, protected, or admin-only
- Creates handler function with proper patterns:
  - Authentication middleware
  - Input validation
  - D1 database queries with prepared statements
  - Error handling
- Registers route in `worker/src/index.js`
- Provides testing instructions

**Example:**
```
User: /add-backend-function
Agent: What endpoint would you like to add?
User: GET /api/user-picks/recent to get the last 10 picks for the logged-in user
```

**Handler Types:**
- **Public Handler** - No auth required (e.g., today's picks)
- **Protected Handler** - Requires authentication (e.g., user's picks)
- **Admin Handler** - Requires admin role (e.g., generate predictions)

---

### 3. `/add-component` - Add React Component

Use when: Creating a new frontend component

**What it does:**
- Creates `.tsx` file with TypeScript template
- Sets up proper imports (React, hooks, types)
- Applies Tailwind CSS styling patterns
- Adds loading and error states
- Integrates API calls if needed
- Provides responsive design patterns

**Example:**
```
User: /add-component
Agent: What component would you like to create?
User: A PredictionCard component that shows a single prediction with match info, odds, and confidence level
```

**Component Patterns:**
- Card-based layout with glassmorphism
- Responsive grid/flex layouts
- Loading skeletons
- Error boundaries
- Accessibility (ARIA labels, semantic HTML)

---

### 4. `/add-table` - Add Database Table

Use when: Adding a new table to the D1 database

**What it does:**
- Asks about data structure and relationships
- Creates SQL schema with proper:
  - Data types (TEXT, INTEGER, REAL, TIMESTAMP)
  - Constraints (NOT NULL, UNIQUE, CHECK, FOREIGN KEY)
  - Indexes for performance
  - Default values
- Adds to `worker/schema.sql`
- Creates migration file in `worker/migrations/`
- Provides migration commands
- Shows testing queries

**Example:**
```
User: /add-table
Agent: What table would you like to create?
User: A notifications table to store user notifications with type, message, read status, and timestamp
```

**Table Patterns:**
- User-related data tables
- Transactional/activity tables
- Reference/lookup tables
- Many-to-many relationship tables

---

### 5. `/review-code` - Code Review Checklist

Use when: Reviewing code before commit/deployment

**What it does:**
- Runs through comprehensive quality checklist:
  - **Security:** SQL injection, XSS, auth checks, rate limiting
  - **Backend:** Input validation, error handling, indexes, CORS
  - **Frontend:** TypeScript types, responsive design, loading states
  - **Performance:** Query optimization, pagination, caching
  - **Accessibility:** ARIA, semantic HTML, keyboard navigation
  - **Testing:** Manual testing, edge cases, error scenarios

**Example:**
```
User: /review-code
Agent: [Runs through checklist, identifies issues, suggests improvements]
```

---

### 6. `/optimize-feature` - Performance Optimization

Use when: Improving performance of existing features

**What it does:**
- Identifies bottlenecks (slow queries, large payloads, render issues)
- Suggests optimizations:
  - Database: Add indexes, optimize queries, use EXPLAIN
  - Backend: Implement caching, pagination, compression
  - Frontend: Code splitting, lazy loading, memoization
- Measures improvement with before/after metrics

**Example:**
```
User: /optimize-feature
Agent: Which feature needs optimization?
User: The leaderboard is loading slowly when there are 1000+ users
```

---

## Code Patterns Reference

### Backend Patterns (Cloudflare Workers)

#### Protected Handler Template
```javascript
export async function handleProtectedAction(request, env) {
  try {
    // Require authentication
    const user = await requireAuth(request, env);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    if (!body.field) {
      return errorResponse('Missing required field', 400);
    }

    // Query D1 database with prepared statement
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

#### D1 Query Patterns
```javascript
// SELECT single row
const user = await env.DB.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(userId).first();

// SELECT multiple rows
const picks = await env.DB.prepare(
  'SELECT * FROM user_picks WHERE user_id = ? ORDER BY placed_at DESC LIMIT 10'
).bind(userId).all();

// INSERT
const result = await env.DB.prepare(
  'INSERT INTO picks (field) VALUES (?)'
).bind(value).run();
const newId = result.meta.last_row_id;

// UPDATE
await env.DB.prepare(
  'UPDATE users SET last_login = ? WHERE id = ?'
).bind(new Date().toISOString(), userId).run();

// DELETE
await env.DB.prepare(
  'DELETE FROM sessions WHERE expires_at < ?'
).bind(new Date().toISOString()).run();
```

---

### Frontend Patterns (React + TypeScript)

#### Component Template
```typescript
interface ComponentNameProps {
  data: DataType;
  onAction?: () => void;
}

export function ComponentName({ data, onAction }: ComponentNameProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/endpoint`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) throw new Error('Failed');

      onAction?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Component content */}
    </div>
  );
}
```

#### Zustand Store Pattern
```typescript
import { create } from 'zustand';

interface StoreState {
  data: DataType[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  addItem: (item: DataType) => void;
  removeItem: (id: number) => void;
}

export const useStoreName = create<StoreState>((set) => ({
  data: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/endpoint`);
      const data = await response.json();
      set({ data: data.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addItem: (item) => set((state) => ({
    data: [...state.data, item]
  })),

  removeItem: (id) => set((state) => ({
    data: state.data.filter(item => item.id !== id)
  })),
}));
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user → returns JWT token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Picks
- `GET /api/picks/today` - Get today's AI picks (public)
- `POST /api/picks/generate` - Generate picks (admin)
- `GET /api/picks/archive` - Get historical picks

### Matches
- `GET /api/matches/today` - Get today's matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/:id` - Get match by ID
- `GET /api/matches/predictions` - Get today's predictions
- `GET /api/matches/value-bets` - Get value bet opportunities
- `POST /api/admin/sync-matches` - Sync matches from API (admin)
- `POST /api/admin/sync-live` - Sync live scores (admin)

### User Picks
- `POST /api/user-picks` - Place user pick (protected)
- `GET /api/user-picks` - Get user's picks (protected)
- `GET /api/user-picks/stats` - Get user stats (protected)
- `GET /api/leaderboard` - Get leaderboard (public)
- `GET /api/user-picks/achievements` - Get achievements (protected)
- `GET /api/user-picks/bankroll` - Get bankroll history (protected)

---

## Development Workflow

### Adding a Complete Feature

1. **Plan the Feature**
   - Define requirements
   - Design database schema
   - Plan API endpoints
   - Sketch UI components

2. **Backend Development**
   - Run `/add-table` to create database tables
   - Run database migration
   - Run `/add-backend-function` for each endpoint
   - Test endpoints with Postman or test scripts

3. **Frontend Development**
   - Run `/add-component` for each UI component
   - Update Zustand store if needed
   - Add routes to React Router
   - Style with Tailwind CSS

4. **Integration**
   - Connect frontend components to API endpoints
   - Add loading and error states
   - Test user flows end-to-end

5. **Quality Assurance**
   - Run `/review-code` for final checks
   - Test on multiple devices (mobile, tablet, desktop)
   - Check performance with `/optimize-feature`

6. **Deployment**
   - Commit changes to Git
   - Push to GitHub (triggers auto-deploy)
   - Verify deployment on Cloudflare Pages/Workers

---

## Quality Checklist

### Backend
- ✅ Input validation implemented
- ✅ Authentication/authorization checked
- ✅ Error handling with try/catch
- ✅ Database indexes created
- ✅ Rate limiting considered
- ✅ CORS headers set correctly
- ✅ SQL injection prevention (prepared statements)
- ✅ Function documented

### Frontend
- ✅ TypeScript props/types defined
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Loading states handled
- ✅ Error states handled
- ✅ Accessibility considered (ARIA, semantic HTML)
- ✅ Form validation if applicable
- ✅ API error handling

### General
- ✅ Follows existing code patterns
- ✅ No security vulnerabilities
- ✅ Documentation updated
- ✅ Tested manually
- ✅ Git commit with clear message

---

## Testing Strategy

### Backend Testing
- Use Postman or test scripts in root directory
- Test authentication flows (register, login, refresh, logout)
- Test protected endpoints with valid/invalid tokens
- Test admin endpoints with admin/non-admin users
- Test edge cases (missing fields, invalid data, rate limits)

### Frontend Testing
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile devices (iOS Safari, Android Chrome)
- Test responsive breakpoints (320px, 768px, 1024px, 1440px)
- Test loading states (network throttling)
- Test error states (disconnect network)
- Test accessibility (screen reader, keyboard navigation)

### Integration Testing
- Test complete user flows:
  - User registration → login → view picks → place bet → check stats
  - Admin login → generate picks → sync matches → view dashboard
- Test real-time updates (live matches, leaderboard)
- Test external API integration (API-Football)

---

## Deployment Guide

### Backend (Cloudflare Workers)

**Deploy command:**
```bash
cd worker
npm run deploy
```

**Environment variables:** Set in `wrangler.toml` or Cloudflare dashboard
- `JWT_SECRET` - Secret key for JWT signing
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens
- `API_FOOTBALL_KEY` - API-Football.com API key
- `OPENAI_API_KEY` - OpenAI API key (optional)

**Database:** D1 database managed in Cloudflare dashboard

### Frontend (Cloudflare Pages)

**Build command:** `npm run build`
**Build output directory:** `dist`
**Node version:** 18 or 20

**Environment variables:** Set in Cloudflare Pages dashboard
- `VITE_API_URL` - Backend API URL (e.g., https://api.footyfortunes.win)

**Auto-deploy:** Enabled on push to `main` branch via GitHub integration

---

## External APIs

### Current Integrations

**API-Football (api-football.com)**
- Fixtures and match data
- Live scores and statistics
- League information
- Integration: `worker/src/services/` or handlers

**Cloudflare AI Workers**
- Model: `@cf/meta/llama-3-8b-instruct`
- Free tier for predictions
- Fallback option when OpenAI unavailable

**OpenAI GPT (Optional)**
- Higher accuracy predictions
- Premium feature
- Cost considerations

---

## Security Best Practices

### Authentication
- JWT tokens (access + refresh)
- Secure token storage (httpOnly cookies or localStorage with care)
- Token expiration and rotation

### Password Security
- bcrypt hashing with salt rounds >= 10
- Never store plain text passwords
- Password strength validation

### API Security
- Rate limiting on sensitive endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (prepared statements)
- XSS prevention (React escapes by default)

### Secrets Management
- Store secrets in Cloudflare environment variables
- Never commit secrets to Git
- Rotate secrets regularly

---

## Performance Optimization Tips

### Database
- Add indexes for frequently queried fields
- Use composite indexes for multi-field queries
- Use `EXPLAIN QUERY PLAN` to analyze slow queries
- Implement pagination for large datasets
- Cache frequently accessed data

### Backend
- Minimize database round-trips
- Use batch operations where possible
- Implement caching (KV storage)
- Compress responses
- Use CDN for static assets

### Frontend
- Code splitting with React Router
- Lazy load components
- Optimize images (WebP format, responsive images)
- Memoize expensive calculations
- Debounce user inputs
- Virtual scrolling for long lists

---

## Troubleshooting

### "Unauthorized" errors
- Check JWT token is being sent in Authorization header
- Verify token hasn't expired
- Check `requireAuth` middleware is working
- Verify user exists in database

### "CORS" errors
- Check CORS headers in `worker/src/utils/response.js`
- Verify `Access-Control-Allow-Origin` includes your frontend URL
- Handle OPTIONS preflight requests

### Slow queries
- Use `EXPLAIN QUERY PLAN SELECT ...` to analyze
- Add missing indexes
- Optimize JOIN operations
- Consider denormalization for read-heavy tables

### Build failures
- Check Node version (18 or 20)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build:check`
- Verify environment variables are set

---

## Resources

### Documentation
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **D1 Database:** https://developers.cloudflare.com/d1/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Zustand:** https://docs.pmnd.rs/zustand/

### External APIs
- **API-Football:** https://www.api-football.com/documentation-v3
- **OpenAI:** https://platform.openai.com/docs

---

## Support

### Test Credentials
See `FINAL-WORKING-CREDENTIALS.txt` for test accounts

### Project Documentation
- `PHASE-1-COMPLETION-SUMMARY.md` - Phase 1 implementation summary
- `PHASE-2-COMPLETION-SUMMARY.md` - Phase 2 implementation summary
- `DEPLOYMENT.md` - Deployment guide
- `SCHEDULED-TASKS.md` - Cron jobs and scheduled tasks

---

## Next Steps

1. **Familiarize yourself with the slash commands** - Try `/new-feature`, `/add-backend-function`, `/add-component`
2. **Review the codebase structure** - Explore `worker/src/` and `frontend/src/`
3. **Check existing features** - See what's already implemented (auth, picks, matches, user-picks)
4. **Plan your enhancements** - Use the enhancement workflows to add new features
5. **Test thoroughly** - Use the testing strategy and quality checklist

---

**Enhancement Agent Status:** ✅ READY
**Last Updated:** November 15, 2025

The enhancement agent is now configured and ready to help you build amazing features for FootyFortunes! 🚀⚽
