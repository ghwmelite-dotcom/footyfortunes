# Add Frontend Component

You are helping to create a new React component for the AI Football Predictions Platform.

## Component Template

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";

interface ComponentNameProps {
  // Define props with TypeScript
}

export function ComponentName({ }: ComponentNameProps) {
  // Convex hooks
  const data = useQuery(api.moduleName.functionName, {});
  const updateData = useMutation(api.moduleName.updateFunctionName);

  // Loading state
  if (data === undefined) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Main component
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Component Title
      </h2>

      {/* Component content */}
      <div className="space-y-4">
        {/* Your content here */}
      </div>
    </motion.div>
  );
}
```

## Design System

### Colors
- Primary: `bg-gradient-to-r from-blue-600 to-purple-600`
- Success: `text-green-600`, `bg-green-50`
- Error: `text-red-600`, `bg-red-50`
- Warning: `text-yellow-600`, `bg-yellow-50`
- Neutral: `text-gray-600`, `bg-gray-50`

### Common Classes
- Card: `bg-white rounded-xl p-6 shadow-lg`
- Button (Primary): `bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all`
- Button (Secondary): `border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-all`
- Badge: `px-3 py-1 rounded-full text-sm font-medium`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### Animation Patterns

#### Fade In
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

#### List Animation
```typescript
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
))}
```

#### Hover Scale
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

## Integration with Dashboard

If this is a new view, add to `Dashboard.tsx`:

```typescript
const views = {
  // ... existing views
  newView: 'New View',
};

// In the render section
{currentView === 'newView' && (
  <div className="space-y-6">
    <NewComponent />
  </div>
)}
```

## Responsive Design Checklist
- [ ] Mobile (< 768px): Single column layout
- [ ] Tablet (768px - 1024px): 2 column layout
- [ ] Desktop (> 1024px): 3 column layout
- [ ] Touch-friendly buttons (min 44px height)
- [ ] Readable text sizes (min 14px)

## Your Task
1. Ask the user what component they want to create
2. Clarify the component's purpose and data needs
3. Implement following the template above
4. Ensure responsive design
5. Add appropriate animations
6. Handle loading and error states

Now ask the user about the component they want to create.
