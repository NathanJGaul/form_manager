import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Create a test form first
    await page.click('text=Form Builder');
    await page.fill('input[placeholder="Enter form name"]', 'Dashboard Test Form');
    await page.click('text=Add Text Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field');
    await page.click('text=Save Form');
    await page.click('text=Dashboard');
  });

  test('should display saved forms', async ({ page }) => {
    await expect(page.locator('text=Dashboard Test Form')).toBeVisible();
  });

  test('should fill and submit form', async ({ page }) => {
    await page.click('text=Fill Form');
    await page.fill('input[placeholder="Enter Test Field"]', 'Test Value');
    await page.click('text=Submit Form');
    await expect(page.locator('text=Form submitted successfully!')).toBeVisible();
  });

  test('should export form data', async ({ page }) => {
    // First submit some data
    await page.click('text=Fill Form');
    await page.fill('input[placeholder="Enter Test Field"]', 'Test Value');
    await page.click('text=Submit Form');
    
    // Go back to dashboard and export
    await page.click('text=Dashboard');
    await page.click('text=Export Data');
    
    // Check that export was initiated (file download)
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export Data');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Dashboard Test Form_data.json');
  });

  test('should delete form template', async ({ page }) => {
    // Mock the confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('text=Delete');
    await expect(page.locator('text=Dashboard Test Form')).not.toBeVisible();
  });
});