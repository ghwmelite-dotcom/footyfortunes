# Code Quality Review

You are helping to review code quality for the AI Football Predictions Platform.

## Review Checklist

### Backend Code Review

#### Type Safety
- [ ] All functions have proper TypeScript types
- [ ] Convex validators used for all arguments (`v.string()`, `v.number()`, etc.)
- [ ] Return types are clear and consistent
- [ ] No `any` types (unless absolutely necessary)

#### Security
- [ ] Authentication guard present (`getAuthUserId`)
- [ ] Admin functions have role checking
- [ ] Input validation prevents injection attacks
- [ ] Sensitive data not exposed in queries
- [ ] Rate limiting considered for expensive operations

#### Database Queries
- [ ] Queries use indexes (`.withIndex()` instead of `.filter()`)
- [ ] All foreign key fields have indexes
- [ ] Composite indexes for common query patterns
- [ ] No N+1 query problems
- [ ] Pagination implemented for large datasets

#### Error Handling
- [ ] Try-catch blocks for external API calls
- [ ] User-friendly error messages
- [ ] Errors logged for debugging
- [ ] Graceful fallbacks for failures
- [ ] No unhandled promise rejections

#### Code Organization
- [ ] Functions have clear, descriptive names
- [ ] Functions do one thing well (single responsibility)
- [ ] Common logic extracted to helper functions
- [ ] Related functions grouped in same file
- [ ] File size reasonable (< 1000 lines)

### Frontend Code Review

#### Component Quality
- [ ] Props defined with TypeScript interfaces
- [ ] Components are reusable and composable
- [ ] No props drilling (max 2-3 levels)
- [ ] Clear component naming (PascalCase)
- [ ] Reasonable component size (< 500 lines)

#### State Management
- [ ] Using Convex hooks for server state
- [ ] Local state for UI-only concerns
- [ ] No unnecessary state
- [ ] State updates are immutable
- [ ] Effects have proper dependencies

#### User Experience
- [ ] Loading states shown (skeleton loaders)
- [ ] Error states handled gracefully
- [ ] Empty states are informative
- [ ] Success feedback provided (toasts, animations)
- [ ] Optimistic updates for better UX

#### Responsive Design
- [ ] Mobile-first approach
- [ ] Tailwind breakpoints used (sm, md, lg, xl)
- [ ] Touch targets min 44px
- [ ] Text readable on all screen sizes
- [ ] No horizontal scrolling on mobile

#### Animations
- [ ] Framer Motion for smooth transitions
- [ ] Animations enhance UX (not distracting)
- [ ] Performance considered (GPU-accelerated properties)
- [ ] Reduced motion respected
- [ ] Animation duration appropriate (0.2-0.5s)

#### Accessibility
- [ ] Semantic HTML elements
- [ ] Alt text for images
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA

### Performance Review

#### Backend Performance
- [ ] Database queries optimized
- [ ] Expensive operations cached
- [ ] Batch operations when possible
- [ ] Unnecessary data not fetched
- [ ] Indexes covering common queries

#### Frontend Performance
- [ ] Components not re-rendering unnecessarily
- [ ] Heavy computations memoized
- [ ] Images optimized
- [ ] Code splitting for large components
- [ ] Bundle size monitored

### Code Style

#### Consistency
- [ ] Follows existing code patterns
- [ ] Naming conventions consistent
- [ ] Indentation consistent (2 spaces)
- [ ] Import order consistent
- [ ] File structure follows conventions

#### Documentation
- [ ] Complex logic has comments
- [ ] Functions have descriptive names (self-documenting)
- [ ] Magic numbers explained
- [ ] TODOs tracked with context
- [ ] API changes documented

### Security Review

#### Common Vulnerabilities
- [ ] No SQL injection (Convex handles this)
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] No sensitive data in localStorage
- [ ] Environment variables used for secrets
- [ ] API keys not in frontend code

#### Data Validation
- [ ] All user input validated
- [ ] Email addresses validated
- [ ] URLs sanitized
- [ ] File uploads validated (if applicable)
- [ ] Rate limiting for mutations

## Review Process

1. **Automated Checks**
   - Run TypeScript compiler: `npx tsc --noEmit`
   - Run linter: `npm run lint` (if configured)
   - Check for console.logs in production code

2. **Manual Review**
   - Read through code line by line
   - Test all user flows
   - Check edge cases
   - Verify error handling
   - Test on different screen sizes

3. **Testing**
   - Test happy path
   - Test error scenarios
   - Test with different user roles
   - Test with empty/null data
   - Test performance with large datasets

## Common Issues and Fixes

### Issue: Slow Queries
```typescript
// Bad - no index
const data = await ctx.db
  .query("table")
  .filter((q) => q.eq(q.field("userId"), userId))
  .collect();

// Good - uses index
const data = await ctx.db
  .query("table")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();
```

### Issue: Props Drilling
```typescript
// Bad - passing through 3 levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />

// Good - fetch at component level
function GrandChild() {
  const data = useQuery(api.module.getData);
  // Use data directly
}
```

### Issue: Missing Error Handling
```typescript
// Bad - no error handling
const result = await aiAction();

// Good - with error handling
try {
  const result = await aiAction();
  toast.success("Success!");
} catch (error) {
  console.error("Error:", error);
  toast.error("Failed to complete action");
}
```

## Your Task
1. Ask the user what they want to review (specific file, feature, or entire codebase)
2. Conduct thorough review using the checklist above
3. Provide specific, actionable feedback
4. Suggest improvements with code examples
5. Highlight what's done well

Now ask the user what they want to review.
