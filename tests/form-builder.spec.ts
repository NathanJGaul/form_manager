import { test, expect } from '@playwright/test';

test.describe('Form Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Form Builder');
  });

  test('should add different field types', async ({ page }) => {
    await page.fill('input[placeholder="Enter form name"]', 'Multi-Field Form');
    
    // Add text field
    await page.click('text=Add Text Field');
    await page.fill('input[placeholder="Field label"]', 'Name');
    
    // Add number field
    await page.click('text=Add Number Field');
    await page.locator('input[placeholder="Field label"]').nth(1).fill('Age');
    
    // Add email field
    await page.click('text=Add Email Field');
    await page.locator('input[placeholder="Field label"]').nth(2).fill('Email');
    
    // Add select field
    await page.click('text=Add Select Field');
    await page.locator('input[placeholder="Field label"]').nth(3).fill('Country');
    
    // Save form
    await page.click('text=Save Form');
    await expect(page.locator('text=Form saved successfully!')).toBeVisible();
  });

  test('should handle field validation', async ({ page }) => {
    await page.fill('input[placeholder="Enter form name"]', 'Validation Test');
    await page.click('text=Add Text Field');
    await page.fill('input[placeholder="Field label"]', 'Required Field');
    await page.check('input[type="checkbox"]'); // Make it required
    await page.click('text=Save Form');
    
    await expect(page.locator('text=Form saved successfully!')).toBeVisible();
  });

  test('should remove fields', async ({ page }) => {
    await page.fill('input[placeholder="Enter form name"]', 'Remove Test');
    await page.click('text=Add Text Field');
    await page.fill('input[placeholder="Field label"]', 'Temp Field');
    
    // Remove the field
    await page.click('text=Remove');
    
    // Verify field is removed
    await expect(page.locator('text=Temp Field')).not.toBeVisible();
  });
});