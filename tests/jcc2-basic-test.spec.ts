import { test, expect } from '@playwright/test';

test.describe('JCC2 Basic Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the app and verify basic functionality', async ({ page }) => {
    test.setTimeout(10000);
    // Verify the app loads
    await expect(page.locator('h1')).toContainText('Form Management System');
    
    // Navigate to form builder
    await page.click('text=New Template');
    await expect(page.locator('h1')).toContainText('Create New Form Template');
    
    // Try to import a template
    await page.click('button:has-text("Import Programmatic")');
    await expect(page.locator('h2:has-text("Import Programmatic Template")')).toBeVisible();
    
    // Try examples tab
    await page.click('text=Examples');
    await expect(page.locator('h3:has-text("JCC2 User Questionnaire")')).toBeVisible();
    
    console.log('✅ Basic test passed - app loads and import modal works');
  });
});