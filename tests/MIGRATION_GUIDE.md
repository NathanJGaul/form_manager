# Test Migration Guide

This guide helps migrate existing Playwright tests to the new testing architecture.

## Migration Checklist

### Phase 1: Setup (Complete)
- [x] Install Vitest and dependencies
- [x] Create test directory structure
- [x] Set up test utilities and helpers
- [x] Create page objects for E2E tests
- [x] Add test fixtures and factories

### Phase 2: Extract Unit Tests
- [ ] Identify pure functions in utils/
- [ ] Create unit tests for formLogic functions
- [ ] Create unit tests for storage operations  
- [ ] Create unit tests for data validation
- [ ] Test CSV integrity checker
- [ ] Test PDF export logic

### Phase 3: Create Component Tests
- [ ] Test FormRenderer component
- [ ] Test FormBuilder component
- [ ] Test Dashboard component
- [ ] Test field components
- [ ] Test conditional rendering

### Phase 4: Refactor E2E Tests
- [ ] Replace text selectors with data-testid
- [ ] Remove waitForTimeout calls
- [ ] Implement page objects
- [ ] Add proper assertions
- [ ] Group related tests

## Migration Examples

### Before: Brittle E2E Test
```typescript
// Old approach
test('should create a form', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  await page.click('text=New Template');
  await page.fill('input[placeholder="Enter form name"]', 'Test Form');
  await page.click('text=Save Template');
  
  await expect(page.locator('text=Template saved')).toBeVisible();
});
```

### After: Refactored E2E Test
```typescript
// New approach with page objects
test('should create a form', async ({ dashboardPage, formBuilderPage }) => {
  await dashboardPage.goto();
  await dashboardPage.newTemplateButton.click();
  
  await formBuilderPage.setFormName('Test Form');
  await formBuilderPage.saveTemplate();
  
  await expect(dashboardPage.getTemplateCard('Test Form')).toBeVisible();
});
```

### Extract Unit Test from E2E
```typescript
// Identify logic that can be unit tested
// OLD: E2E test for validation
test('should validate email', async ({ page }) => {
  // ... navigate to form
  await page.fill('input[type="email"]', 'invalid');
  await expect(page.locator('text=Invalid email')).toBeVisible();
});

// NEW: Unit test for validation logic
describe('validateField', () => {
  it('should validate email format', () => {
    const field = { type: 'email', required: true };
    expect(validateField(field, 'invalid')).toBe('Please enter a valid email address');
    expect(validateField(field, 'test@example.com')).toBe('');
  });
});
```

## Step-by-Step Migration Process

### 1. Add data-testid to Components
```tsx
// In React components
<button data-testid="save-form-button">Save Form</button>
<input data-testid="form-name-input" />
```

### 2. Create Page Object
```typescript
export class FormBuilderPage extends BasePage {
  readonly formNameInput = this.page.getByTestId('form-name-input');
  readonly saveButton = this.page.getByTestId('save-form-button');
  
  async setFormName(name: string) {
    await this.formNameInput.fill(name);
  }
}
```

### 3. Refactor Test
```typescript
test('form builder test', async ({ formBuilderPage }) => {
  await formBuilderPage.goto();
  await formBuilderPage.setFormName('My Form');
  await formBuilderPage.saveTemplate();
});
```

## Common Patterns to Replace

### Replace Hard-coded Waits
```typescript
// Bad
await page.waitForTimeout(1500);

// Good
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

### Replace Text Selectors
```typescript
// Bad
await page.click('text=Submit Form');

// Good
await page.getByRole('button', { name: 'Submit Form' }).click();
// Or with data-testid
await page.getByTestId('submit-button').click();
```

### Replace Direct Navigation
```typescript
// Bad
await page.goto('/form-builder');

// Good
await formBuilderPage.goto();
```

## Testing Priority

1. **Critical User Journeys** (E2E)
   - Form creation and saving
   - Form filling and submission
   - Data export (PDF/CSV)

2. **Core Business Logic** (Unit)
   - Conditional logic evaluation
   - Form validation
   - Progress calculation

3. **Component Behavior** (Unit)
   - Field rendering
   - User interactions
   - State management

4. **Integration Points** (Integration)
   - Storage persistence
   - Import/export workflows
   - Multi-step forms

## Tips for Migration

1. **Start Small**: Migrate one test file at a time
2. **Run in Parallel**: Keep old tests running while migrating
3. **Verify Coverage**: Ensure no functionality is left untested
4. **Clean as You Go**: Remove old tests after successful migration
5. **Document Changes**: Update test documentation

## Resources

- [Vitest Migration Guide](https://vitest.dev/guide/migration.html)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)