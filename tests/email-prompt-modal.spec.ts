import { test, expect } from '@playwright/test';

test.describe('Email Prompt Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should show email modal after form submission', async ({ page }) => {
    // Navigate to a form
    await page.waitForSelector('.grid'); // Wait for templates grid
    
    // Find and click Start on the first template
    const firstTemplateCard = page.locator('.bg-white.rounded-lg.shadow-md').first();
    await firstTemplateCard.locator('button:has-text("Start")').click();
    
    // Wait for form to load
    await page.waitForSelector('h1'); // Form title
    
    // Fill some basic form data (adjust based on your test form)
    const textInputs = await page.locator('input[type="text"]').all();
    for (let i = 0; i < Math.min(2, textInputs.length); i++) {
      await textInputs[i].fill(`Test value ${i + 1}`);
    }
    
    // Submit the form
    await page.locator('button:has-text("Submit Form")').click();
    
    // Verify email modal appears
    await expect(page.locator('h2:has-text("Email Form Data")')).toBeVisible({ timeout: 5000 });
    
    // Verify modal elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="form_submission"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Email")')).toBeVisible();
    await expect(page.locator('button:has-text("Skip")')).toBeVisible();
  });

  test('should validate email address', async ({ page }) => {
    // Navigate to form and submit (reuse the navigation from above)
    await page.waitForSelector('.grid');
    const firstTemplateCard = page.locator('.bg-white.rounded-lg.shadow-md').first();
    await firstTemplateCard.locator('button:has-text("Start")').click();
    await page.waitForSelector('h1');
    await page.locator('button:has-text("Submit Form")').click();
    await expect(page.locator('h2:has-text("Email Form Data")')).toBeVisible({ timeout: 5000 });
    
    // Try to send without email
    await page.locator('button:has-text("Send Email")').click();
    await expect(page.locator('text=Please enter an email address')).toBeVisible();
    
    // Try invalid email
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('button:has-text("Send Email")').click();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Try valid email
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('button:has-text("Send Email")').click();
    
    // Should trigger mailto (hard to test in Playwright, but no error should appear)
    await page.waitForTimeout(500);
  });

  test('should allow skipping email prompt', async ({ page }) => {
    // Navigate to form and submit
    await page.waitForSelector('.grid');
    const firstTemplateCard = page.locator('.bg-white.rounded-lg.shadow-md').first();
    await firstTemplateCard.locator('button:has-text("Start")').click();
    await page.waitForSelector('h1');
    await page.locator('button:has-text("Submit Form")').click();
    await expect(page.locator('h2:has-text("Email Form Data")')).toBeVisible({ timeout: 5000 });
    
    // Click Skip
    await page.locator('button:has-text("Skip")').click();
    
    // Should return to dashboard
    await expect(page.locator('h1:has-text("Form Management System")')).toBeVisible({ timeout: 5000 });
  });

  test('should customize CSV filename', async ({ page }) => {
    // Navigate to form and submit
    await page.waitForSelector('.grid');
    const firstTemplateCard = page.locator('.bg-white.rounded-lg.shadow-md').first();
    await firstTemplateCard.locator('button:has-text("Start")').click();
    await page.waitForSelector('h1');
    await page.locator('button:has-text("Submit Form")').click();
    await expect(page.locator('h2:has-text("Email Form Data")')).toBeVisible({ timeout: 5000 });
    
    // Check filename input
    const filenameInput = page.locator('input[placeholder="form_submission"]');
    const currentValue = await filenameInput.inputValue();
    expect(currentValue).toContain('_submission');
    
    // Change filename
    await filenameInput.clear();
    await filenameInput.fill('my_custom_filename');
    
    // Verify .csv extension is shown
    await expect(page.locator('span:has-text(".csv")')).toBeVisible();
  });
});