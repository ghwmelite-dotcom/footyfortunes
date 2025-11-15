# Optimize Feature

You are helping to optimize an existing feature in the AI Football Predictions Platform.

## Optimization Categories

### 1. Performance Optimization

#### Database Query Optimization
```typescript
// Before: Multiple separate queries (N+1 problem)
const users = await ctx.db.query("users").collect();
for (const user of users) {
  const stats = await ctx.db.query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();
  // Process stats...
}

// After: Batch query with Promise.all
const users = await ctx.db.query("users").collect();
const statsPromises = users.map(user =>
  ctx.db.query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first()
);
const allStats = await Promise.all(statsPromises);
```

#### Pagination
```typescript
// Add pagination to large datasets
export const getPaginatedData = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tableName")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Frontend usage
const { results, loadMore } = usePaginatedQuery(
  api.module.getPaginatedData,
  {},
  { initialNumItems: 20 }
);
```

#### Caching Strategy
```typescript
// Cache expensive computations
const computeExpensiveMetrics = async (ctx: QueryCtx, userId: Id<"users">) => {
  // Check cache first
  const cached = await ctx.db
    .query("metricsCache")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
    .first();

  if (cached) return cached.data;

  // Compute if not cached
  const metrics = await computeMetrics(ctx, userId);

  // Store in cache (expires in 1 hour)
  await ctx.db.insert("metricsCache", {
    userId,
    data: metrics,
    expiresAt: Date.now() + 3600000,
  });

  return metrics;
};
```

### 2. Code Quality Optimization

#### Extract Reusable Functions
```typescript
// Before: Duplicated logic
const accuracy1 = (correct / total) * 100;
const accuracy2 = (correct / total) * 100;

// After: Reusable helper
const calculateAccuracy = (correct: number, total: number): number => {
  return total === 0 ? 0 : (correct / total) * 100;
};
```

#### Reduce Complexity
```typescript
// Before: Nested conditions
if (user) {
  if (user.role === "admin") {
    if (user.isActive) {
      // Do something
    }
  }
}

// After: Early returns
if (!user) return;
if (user.role !== "admin") return;
if (!user.isActive) return;
// Do something
```

### 3. UX Optimization

#### Loading States
```typescript
// Add skeleton loaders instead of spinners
if (data === undefined) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
```

#### Optimistic Updates
```typescript
const updateItem = useMutation(api.module.updateItem);

const handleUpdate = async (id: Id<"items">, newValue: string) => {
  // Optimistically update UI
  setLocalState(prev => ({
    ...prev,
    [id]: newValue
  }));

  try {
    await updateItem({ id, value: newValue });
  } catch (error) {
    // Revert on error
    setLocalState(prev => ({
      ...prev,
      [id]: oldValue
    }));
    toast.error("Update failed");
  }
};
```

#### Debouncing User Input
```typescript
import { useState, useEffect } from "react";

function SearchComponent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Use debounced value for query
  const results = useQuery(api.module.search, {
    query: debouncedSearch
  });
}
```

### 4. Bundle Size Optimization

#### Code Splitting
```typescript
// Before: Import everything
import { HeavyComponent } from "./HeavyComponent";

// After: Lazy load
import { lazy, Suspense } from "react";
const HeavyComponent = lazy(() => import("./HeavyComponent"));

// Usage
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

#### Tree Shaking
```typescript
// Before: Import entire library
import _ from "lodash";

// After: Import only what you need
import debounce from "lodash/debounce";
```

### 5. Accessibility Optimization

#### Keyboard Navigation
```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
  aria-label="Action description"
>
```

#### Screen Reader Support
```typescript
<div role="status" aria-live="polite">
  {loading ? "Loading..." : `${results.length} results found`}
</div>
```

### 6. Security Optimization

#### Input Sanitization
```typescript
// Sanitize user input before storing
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script>/gi, "")
    .substring(0, 1000); // Limit length
};

export const createPost = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const sanitized = sanitizeInput(args.content);
    await ctx.db.insert("posts", {
      content: sanitized,
      userId: await getAuthUserId(ctx),
      createdAt: Date.now(),
    });
  },
});
```

#### Rate Limiting
```typescript
// Track user actions to prevent abuse
const checkRateLimit = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  action: string,
  maxPerHour: number
) => {
  const oneHourAgo = Date.now() - 3600000;

  const recentActions = await ctx.db
    .query("userActions")
    .withIndex("by_user_and_action", (q) =>
      q.eq("userId", userId).eq("action", action)
    )
    .filter((q) => q.gt(q.field("timestamp"), oneHourAgo))
    .collect();

  if (recentActions.length >= maxPerHour) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Log action
  await ctx.db.insert("userActions", {
    userId,
    action,
    timestamp: Date.now(),
  });
};
```

## Optimization Process

1. **Identify Bottleneck**
   - Use browser DevTools (Performance tab)
   - Check Convex dashboard for slow queries
   - Monitor bundle size
   - Test on slow devices/connections

2. **Measure Current Performance**
   - Page load time
   - Time to interactive
   - Query execution time
   - Bundle size
   - Memory usage

3. **Apply Optimization**
   - Implement one optimization at a time
   - Follow patterns above
   - Test thoroughly

4. **Measure Improvement**
   - Compare before/after metrics
   - Ensure functionality unchanged
   - Check for regressions

5. **Document Changes**
   - Note what was optimized
   - Record performance gains
   - Update relevant documentation

## Common Optimizations by Feature

### Leaderboards
- Pagination (show top 100, paginate rest)
- Cache results (refresh every 5 minutes)
- Index on ranking field

### Analytics Charts
- Aggregate data server-side
- Limit time range options
- Cache computed metrics

### Social Feed
- Infinite scroll with pagination
- Lazy load images
- Virtual scrolling for very long lists

### Live Features
- WebSocket for real-time updates
- Throttle update frequency (every 10s, not every second)
- Only fetch for visible matches

## Your Task
1. Ask the user what they want to optimize
2. Identify the specific bottleneck or issue
3. Propose optimization strategy
4. Implement the optimization
5. Measure and verify improvement

Now ask the user what feature they want to optimize.
