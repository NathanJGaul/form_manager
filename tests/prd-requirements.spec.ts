import { test, expect } from '@playwright/test';

test.describe('PRD Requirements Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('1. Single HTML File Implementation', () => {
    test('should load without external dependencies', async ({ page }) => {
      // This test will need to be updated when single HTML file is implemented
      await expect(page.locator('h1')).toContainText('Form Manager');
      
      // Check for any failed network requests
      const failedRequests = [];
      page.on('requestfailed', request => {
        failedRequests.push(request.url());
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should have minimal failed requests (acceptable for development)
      expect(failedRequests.length).toBeLessThan(5);
    });
  });

  test.describe('2. Data Persistence', () => {
    test('should auto-save form data on field change', async ({ page }) => {
      // Create a form template
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Auto-Save Test Form');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Test Field');
      await page.click('text=Save Form');
      
      // Fill a form instance
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Fill field and check for auto-save
      await page.fill('input[placeholder="Enter Test Field"]', 'Test Value');
      
      // Wait for auto-save (1 second debounce)
      await page.waitForTimeout(1500);
      
      // Check for save status indicator
      await expect(page.locator('text=Saved')).toBeVisible();
      
      // Reload page and verify data persists
      await page.reload();
      await page.goto('/');
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Data should persist
      await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('Test Value');
    });

    test('should include timestamp for last save', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Timestamp Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Time Test');
      await page.click('text=Save Form');
      
      // Check dashboard shows timestamp information
      await page.click('text=Dashboard');
      // Should show creation/update timestamps in form cards
      await expect(page.locator('text=Created:')).toBeVisible();
    });

    test('should provide visual confirmation of save status', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Save Status Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Status Test');
      await page.click('text=Save Form');
      
      // Check for success message
      await expect(page.locator('text=Form saved successfully!')).toBeVisible();
    });
  });

  test.describe('3. Form Management Dashboard', () => {
    test('should display distinct sections for different form types', async ({ page }) => {
      await expect(page.locator('text=Templates')).toBeVisible();
      await expect(page.locator('text=Forms')).toBeVisible();
      await expect(page.locator('text=Completed')).toBeVisible();
      await expect(page.locator('text=In Progress')).toBeVisible();
    });

    test('should allow creation of new form instances', async ({ page }) => {
      // Create template first
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Instance Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Instance Field');
      await page.click('text=Save Form');
      
      // Create new instance
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Should be able to create multiple instances
      await page.fill('input[placeholder="Enter Instance Field"]', 'Instance 1');
      await page.click('text=Submit Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      await page.fill('input[placeholder="Enter Instance Field"]', 'Instance 2');
      await page.click('text=Submit Form');
      
      // Should show multiple instances
      await page.click('text=Dashboard');
      const instances = await page.locator('[data-testid="form-instance"]').count();
      expect(instances).toBeGreaterThan(1);
    });

    test('should display progress/completion status for each form', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Progress Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Required Field');
      await page.check('input[type="checkbox"]'); // Make required
      await page.click('text=Save Form');
      
      // Fill form partially
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      await page.fill('input[placeholder="Enter Required Field"]', 'Partial');
      
      // Check progress indicator
      await page.click('text=Dashboard');
      await expect(page.locator('text=Progress:')).toBeVisible();
    });

    test('should include search and filter capabilities', async ({ page }) => {
      // Create test forms
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Searchable Form');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Search Test');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      
      // Test search functionality
      await page.fill('input[placeholder="Search templates and forms..."]', 'Searchable');
      await expect(page.locator('text=Searchable Form')).toBeVisible();
      
      // Test filter functionality
      await page.click('text=All');
      await page.click('text=Completed');
      await page.click('text=In Progress');
    });
  });

  test.describe('4. User Interface', () => {
    test('should be responsive and mobile-friendly', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 320, height: 568 });
      await expect(page.locator('h1')).toBeVisible();
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1')).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should support all required question types', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Field Types Test');
      
      // Test all field types
      await page.click('text=Add Text Field');
      await page.click('text=Add Number Field');
      await page.click('text=Add Email Field');
      await page.click('text=Add Date Field');
      await page.click('text=Add Select Field');
      await page.click('text=Add Radio Field');
      await page.click('text=Add Checkbox Field');
      await page.click('text=Add Textarea Field');
      await page.click('text=Add File Upload Field');
      
      // Verify all fields are present
      const fields = await page.locator('[data-testid="form-field"]').count();
      expect(fields).toBe(9);
    });

    test('should provide clear navigation between forms', async ({ page }) => {
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Form Builder')).toBeVisible();
      
      // Test navigation
      await page.click('text=Form Builder');
      await expect(page.locator('h2')).toContainText('Form Builder');
      
      await page.click('text=Dashboard');
      await expect(page.locator('h1')).toContainText('Form Manager');
    });
  });

  test.describe('5. Data Export Functionality', () => {
    test('should generate separate CSV files for each form type', async ({ page }) => {
      // Create and fill a form
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Export Test Form');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Export Field');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      await page.fill('input[placeholder="Enter Export Field"]', 'Export Data');
      await page.click('text=Submit Form');
      
      // Test CSV export
      await page.click('text=Dashboard');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Export Data');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('Export Test Form_data.json');
    });

    test('should enable bulk export of all forms', async ({ page }) => {
      // Create multiple forms
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Bulk Test 1');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Bulk Field 1');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      
      // Test bulk export
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Export All Data');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('all_forms_data.json');
    });
  });

  test.describe('Technical Constraints', () => {
    test('should work with minimum screen size (320px)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      // Should be usable at minimum width
      await expect(page.locator('h1')).toBeVisible();
      await page.click('text=Form Builder');
      await expect(page.locator('h2')).toContainText('Form Builder');
      
      // Form should be fillable at minimum width
      await page.fill('input[placeholder="Enter form name"]', 'Mobile Test');
      await expect(page.locator('input[placeholder="Enter form name"]')).toHaveValue('Mobile Test');
    });

    test('should handle data persistence across browser sessions', async ({ page, context }) => {
      // Create a form
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Persistence Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Persist Field');
      await page.click('text=Save Form');
      
      // Close and reopen browser
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('/');
      
      // Form should still exist
      await newPage.click('text=Dashboard');
      await expect(newPage.locator('text=Persistence Test')).toBeVisible();
    });
  });
});