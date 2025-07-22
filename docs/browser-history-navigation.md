# Browser History Navigation

## Overview

The form_manager implements a custom browser history integration that provides URL-based navigation without external routing libraries. This system enables bookmarkable URLs, browser back/forward navigation, and deep linking to specific form sections while maintaining the application's commitment to minimal dependencies.

## Architecture

### Core Components

**AppRouter** (`src/components/AppRouter.tsx`)
- Central routing orchestrator managing application navigation state
- Handles browser history events and URL parsing
- Implements lazy loading for route components
- Manages transitions between dashboard, builder, and form routes

**useFormHistory Hook** (`src/hooks/useFormHistory.ts`)
- Custom hook providing browser history API integration
- Manages URL building, parsing, and history state updates
- Prevents recursive navigation updates with internal guards
- Exports `FormHistoryState` interface for type-safe navigation

**Route Components**
- `DashboardRoute`: Template and instance management
- `BuilderRoute`: Form template creation and editing
- `FormRoute`: Form rendering with instance management

### URL Structure

```
/ - Dashboard view
/builder - Create new template
/builder/{templateId} - Edit existing template
/form/{templateId} - Start new form instance
/form/{templateId}/{instanceId} - Continue existing form
/form/{templateId}/{instanceId}?section=2&view=section - Deep link to section
```

### Query Parameters
- `section`: Current section index in section-by-section view (0-based)
- `view`: Form view mode (`continuous` or `section`)

## Implementation Details

### Navigation Flow

1. **User Navigation**: User clicks navigation element
2. **State Update**: AppRouter updates internal route state
3. **URL Update**: useFormHistory updates browser URL
4. **History Entry**: Browser history API creates navigation entry
5. **Component Render**: Appropriate route component renders

### Browser Navigation (Back/Forward)

1. **PopState Event**: Browser fires popstate on back/forward
2. **State Restoration**: AppRouter reads history state or parses URL
3. **Route Restoration**: Components restore from localStorage using IDs
4. **UI Update**: Application reflects previous navigation state

### Deep Linking

The system supports direct navigation to specific application states:
- Link to specific template in builder
- Link to form instance at specific section
- Preserve view mode preferences in URL
- Restore complete application state from URL

## Features

### Bookmarkable URLs
Users can bookmark and share specific application states:
- Template editing sessions
- Partially completed forms
- Specific form sections

### Section Navigation
In section-by-section view mode:
- URL updates reflect current section
- Direct navigation to sections via URL
- Progress preserved across navigation

### State Persistence
- Form data stored in localStorage
- URL contains references (IDs) not data
- Navigation state recovered from URL + localStorage

### Progressive Enhancement
- Application works without JavaScript (static rendering)
- Enhanced with client-side navigation when available
- Graceful fallback for unsupported browsers

## Usage Patterns

### Navigation Hooks
```typescript
const { updateUrl, replaceUrlParams } = useFormHistory();

// Navigate to new route
updateUrl({ 
  routeType: 'form', 
  templateId: 'template-123',
  instanceId: 'instance-456'
});

// Update URL parameters without navigation
replaceUrlParams({ 
  viewMode: 'section',
  sectionIndex: 3 
});
```

### Route Components
```typescript
// Routes receive navigation props
<FormRoute
  template={template}
  instance={instance}
  initialSectionIndex={sectionIndex}
  initialViewMode={viewMode}
/>
```

## Benefits

### User Experience
- Familiar browser navigation behavior
- Shareable links to specific form states
- No lost work on accidental navigation
- Quick access to previous forms via history

### Developer Experience
- No external routing library dependencies
- Type-safe navigation with TypeScript
- Clear URL structure for debugging
- Centralized navigation logic

### Performance
- Lazy loading reduces initial bundle size
- Minimal overhead for navigation
- Efficient state restoration
- No unnecessary re-renders

## Integration Points

### LocalStorage Integration
- Templates and instances loaded by ID from URL
- Data persistence separate from navigation
- Efficient lookups using URL parameters

### Form State Synchronization
- View mode changes reflected in URL
- Section navigation updates URL
- Form progress tracked independently

### Error Handling
- Invalid URLs redirect to dashboard
- Missing templates/instances handled gracefully
- Navigation guards prevent invalid states

## Future Enhancements

Potential improvements to the navigation system:
- URL parameter encryption for sensitive data
- Navigation analytics and tracking
- Breadcrumb navigation generation
- Keyboard navigation shortcuts

---

*This documentation describes the browser history navigation implementation. For routing patterns and component integration, see the hooks documentation and component guides.*