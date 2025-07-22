# Form Manager Testing Documentation

## Overview

This project uses a comprehensive testing strategy with three levels of testing:
- **Unit Tests** (Vitest) - Fast, isolated component and utility testing
- **Integration Tests** (Vitest) - Component interaction and workflow testing
- **E2E Tests** (Playwright) - Full user journey testing in real browsers

## Test Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── features/          # Feature-based test organization
│   ├── smoke/             # Critical path tests
│   ├── pages/             # Page Object Models
│   ├── fixtures/          # Test data and fixtures
│   └── helpers/           # E2E utilities
│
src/__tests__/
├── unit/                  # Vitest unit tests
│   ├── components/        # React component tests
│   ├── utils/             # Utility function tests
│   ├── hooks/             # Custom hook tests
│   └── programmatic/      # Programmatic API tests
├── integration/           # Vitest integration tests
│   ├── form-flow/         # Form workflow tests
│   ├── template-system/   # Template system tests
│   └── data-persistence/  # Storage integration tests
└── test-utils/            # Shared test utilities
    ├── factories/         # Test data factories
    ├── mocks/            # Mock implementations
    └── render.tsx        # Custom render with providers
```

## Running Tests

### Unit Tests
```bash
npm run test:unit              # Run all unit tests
npm run test:unit:watch        # Run in watch mode
npm run test:unit:coverage     # Generate coverage report
```

### Integration Tests
```bash
npm run test:integration       # Run all integration tests
```

### E2E Tests
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:headed       # Run with browser visible
npm run test:e2e:debug        # Debug mode
npm run test:e2e:ui           # Playwright UI mode
```

### Run All Tests
```bash
npm test                      # Run unit tests then E2E tests
```

## Writing Tests

### Unit Tests

Use the custom render function that includes providers:

```typescript
import { render, screen, userEvent } from '@/__tests__/test-utils/render';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test workflows across multiple components:

```typescript
describe('Form Submission Flow', () => {
  it('should save form data and generate PDF', async () => {
    // Test complete workflow
  });
});
```

### E2E Tests

Use Page Object Model pattern:

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('should create and fill a form', async ({ 
  dashboardPage, 
  formBuilderPage,
  formRendererPage 
}) => {
  // Navigate to builder
  await dashboardPage.newTemplateButton.click();
  
  // Create form
  await formBuilderPage.createBasicForm({
    name: 'Test Form',
    sections: [...]
  });
  
  // Fill and submit
  await formRendererPage.completeForm({
    'Field 1': 'Value 1'
  });
});
```

## Test Data Management

### Factories

Use factories for consistent test data:

```typescript
import { templateFactory, fieldFactory } from '../test-utils/factories';

const template = templateFactory.build({
  name: 'Custom Template'
});

const field = fieldFactory.text({
  label: 'Custom Field',
  required: true
});
```

### Fixtures

E2E tests use shared fixtures:

```typescript
const testData = {
  templates: {
    simple: { /* template data */ },
    complex: { /* template data */ }
  },
  formData: {
    simple: { /* form values */ }
  }
};
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- One assertion per test when possible

### 2. Selectors (E2E)
- Prefer data-testid attributes
- Use accessibility roles
- Avoid text-based selectors

### 3. Async Operations
- Always use proper wait strategies
- Avoid hard-coded timeouts
- Use waitFor for assertions

### 4. Test Isolation
- Each test should be independent
- Clean up after tests
- Don't rely on test order

### 5. Mocking
- Mock external dependencies
- Use realistic test data
- Keep mocks simple

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Nightly builds

### GitHub Actions Workflow

```yaml
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:integration
    npm run test:e2e
```

## Debugging

### Unit/Integration Tests
```bash
# Debug in VS Code
# Add breakpoint and run "Debug Test" from test file
```

### E2E Tests
```bash
# Debug mode with Playwright Inspector
npm run test:e2e:debug

# UI mode for interactive debugging
npm run test:e2e:ui
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key workflows covered
- **E2E Tests**: Critical user journeys

View coverage reports:
```bash
npm run test:unit:coverage
# Open coverage/index.html in browser
```

## Common Issues

### localStorage in Tests
Tests automatically clear localStorage between runs. Use page objects' `clearLocalStorage()` method if needed.

### Flaky E2E Tests
- Use proper wait strategies
- Increase timeout for slow operations
- Use retry mechanism for network requests

### Mock Data
Always use factories for consistent test data. Avoid hardcoding values.

## Adding New Tests

1. **Unit Test**: Create file in `src/__tests__/unit/[category]/`
2. **Integration Test**: Create file in `src/__tests__/integration/[feature]/`
3. **E2E Test**: Create file in `tests/e2e/features/[feature]/`
4. Use appropriate test utilities and patterns
5. Run tests locally before committing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)