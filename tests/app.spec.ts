import { test, expect } from '@playwright/test';

test.describe('Form Manager App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the app successfully', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Form Management System');
  });

  test('should navigate to form builder', async ({ page }) => {
    await page.click('text=New Template');
    await expect(page.locator('h1')).toContainText('Form Builder');
  });

  test('should create a new form', async ({ page }) => {
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Test Form');
    await page.click('text=Add Text Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field');
    await page.click('text=Save Template');
    await expect(page.locator('text=Template saved successfully!')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Form Builder');
    await page.click('text=Save Form');
    await expect(page.locator('text=Please enter a form name')).toBeVisible();
  });

  test('should render saved form', async ({ page }) => {
    // Create a form first
    await page.click('text=Form Builder');
    await page.fill('input[placeholder="Enter form name"]', 'Test Form');
    await page.click('text=Add Text Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field');
    await page.click('text=Save Form');
    
    // Navigate to dashboard and check the form
    await page.click('text=Dashboard');
    await expect(page.locator('text=Test Form')).toBeVisible();
  });
});