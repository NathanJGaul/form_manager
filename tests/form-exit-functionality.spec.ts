import { test, expect } from '@playwright/test';

test.describe('Form Exit Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show exit button when filling out a form', async ({ page }) => {
    // Create a simple template first
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Test Exit Form');
    await page.click('text=Add Section');
    await page.click('text=Add Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field');
    await page.click('text=Save Template');

    // Now start filling out the form
    await page.click('text=Start', { timeout: 10000 });
    
    // Check that exit button is visible
    await expect(page.locator('text=Exit')).toBeVisible();
  });

  test('should handle exit with unsaved changes', async ({ page }) => {
    // Create a simple template first
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Test Exit Form 2');
    await page.click('text=Add Section');
    await page.click('text=Add Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field 2');
    await page.click('text=Save Template');

    // Start filling out the form
    await page.click('text=Start', { timeout: 10000 });
    
    // Make changes to the form
    await page.fill('input[placeholder="Enter Test Field 2"]', 'Some test data');
    
    // Set up dialog handler to simulate "Yes, save" response
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('unsaved changes');
      await dialog.accept();
    });
    
    // Click exit button
    await page.click('text=Exit');
    
    // Should be back on dashboard
    await expect(page.locator('text=Form Management System')).toBeVisible();
  });

  test('should handle exit without unsaved changes', async ({ page }) => {
    // Create a simple template first
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Test Exit Form 3');
    await page.click('text=Add Section');
    await page.click('text=Add Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field 3');
    await page.click('text=Save Template');

    // Start filling out the form
    await page.click('text=Start', { timeout: 10000 });
    
    // Click exit button without making changes
    await page.click('text=Exit');
    
    // Should be back on dashboard without any confirmation
    await expect(page.locator('text=Form Management System')).toBeVisible();
  });
});