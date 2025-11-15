# Add New Feature

You are helping to add a new feature to the AI Football Predictions Platform.

## Context
This is a full-stack betting predictions platform built with:
- Backend: Convex (TypeScript)
- Frontend: React 19 + TypeScript + Tailwind CSS
- Database: 40+ tables in convex/schema.ts
- Current Features: TIER 1 (Gamification, Bankroll, Value Bets, Advanced AI) + TIER 2 (Social Trading, Enhanced Analytics, AI Assistant, Live Features)

## Your Task
1. Ask the user what feature they want to add
2. Clarify requirements and scope
3. Follow this workflow:

### Step 1: Database Schema
- Update `convex/schema.ts` with new tables/fields
- Add appropriate indexes for query optimization
- Use proper Convex validators (v.string(), v.number(), v.id(), etc.)

### Step 2: Backend Implementation
- Create new file in `convex/` or update existing one
- Implement queries/mutations/actions following existing patterns
- Add authentication guards where needed
- Implement proper error handling
- Use TypeScript types throughout

### Step 3: Frontend Components
- Create new components in `src/components/`
- Use Convex hooks (useQuery, useMutation, useAction)
- Apply Tailwind CSS styling (match existing design system)
- Add Framer Motion animations for smooth UX
- Handle loading and error states

### Step 4: Integration
- Update `Dashboard.tsx` if adding new navigation view
- Ensure responsive design (mobile/tablet/desktop)
- Test all user flows

### Step 5: Documentation
- Add feature documentation
- Update relevant guide files

## Code Pattern References
Refer to `.claude/enhancement-agent-config.json` for:
- Code patterns and conventions
- Quality checklists
- Common patterns (leaderboards, statistics, forms)

## Quality Standards
Ensure:
- Type safety (TypeScript)
- Security (auth guards, input validation)
- Performance (database indexes, pagination)
- UX (loading states, animations, error handling)
- Consistency (follows existing code patterns)

Now ask the user about the feature they want to add and guide them through implementation.
