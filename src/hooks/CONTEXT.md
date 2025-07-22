# Hooks Context

## Overview
Custom React hooks for form_manager providing reusable logic for state management, browser integration, and cross-component functionality.

## Architecture Principles
- **Type-first design**: All hooks export TypeScript interfaces alongside implementation
- **Memoization**: Use `useCallback` and `useMemo` for performance optimization
- **Clean separation**: Each hook has a single, well-defined responsibility
- **Browser API integration**: Safely integrate with browser APIs with proper guards
- **Barrel exports**: Use index.ts for clean, centralized exports

## Current Hooks

### useFormHistory
Manages browser history API integration for form navigation, providing URL-based state persistence and navigation control.

**Key Features:**
- URL building and parsing for different route types (dashboard, builder, form)
- Browser history state management with push/replace operations
- Navigation guard to prevent recursive updates
- Query parameter handling for view modes and sections

**Integration Points:**
- `AppRouter`: Uses for popstate handling and initial URL parsing
- `FormRenderer`: Uses for syncing URL params with view mode and section state

**Usage Example:**
```typescript
const { buildPath, parseCurrentUrl, updateUrl, replaceUrlParams } = useFormHistory();

// Update URL when navigating
updateUrl({ routeType: 'form', templateId: 'abc123', instanceId: 'xyz789' });

// Replace URL params without adding history entry
replaceUrlParams({ viewMode: 'section', sectionIndex: 2 });
```

## Integration Patterns

### Component Integration
- Hooks should be imported at the top of components
- Destructure only needed functions to optimize bundle size
- Handle edge cases (e.g., SSR) with appropriate guards

### State Synchronization
- Use `replaceUrlParams` for state updates that shouldn't create history entries
- Use `updateUrl` for navigation actions that should be part of browser history
- Always check `isNavigating` to prevent recursive updates

### URL Parameter Management
- Keep URL parameters minimal and user-friendly
- Use query strings for view options (section, view mode)
- Use path segments for resource identifiers (template ID, instance ID)

## Future Hooks Guidelines

### Naming Conventions
- Always prefix with `use` (e.g., `useFormValidation`, `useAutoSave`)
- Be descriptive but concise (avoid `useFormDataManagementAndValidation`)
- Follow camelCase convention

### Type Safety Requirements
- Export TypeScript interfaces for all hook return values
- Define proper types for all parameters
- Avoid using `any` type

### Structure Pattern
```typescript
// Define types
export interface UseHookNameReturn {
  // Return value types
}

export interface HookOptions {
  // Optional configuration
}

// Implement hook
export const useHookName = (options?: HookOptions): UseHookNameReturn => {
  // Implementation
};
```

### Testing Patterns
- Test hooks in isolation using React Testing Library's `renderHook`
- Mock browser APIs when necessary
- Test edge cases and error conditions

---

*This file documents the hooks directory patterns and current implementations. Update this file when adding new hooks or changing existing patterns.*