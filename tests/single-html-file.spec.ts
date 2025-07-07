import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Single HTML File Implementation', () => {
  const singleHtmlPath = path.join(process.cwd(), 'dist/standalone-form-manager.html');
  
  test.beforeEach(async ({ page }) => {
    // Load the single HTML file directly
    await page.goto(`file://${singleHtmlPath}`);
  });

  test('should load completely from single HTML file', async ({ page }) => {
    // Verify the main application loads
    await expect(page.locator('h1')).toContainText('Form Management System');
    
    // Check that all expected elements are present
    await expect(page.locator('text=Templates')).toBeVisible();
    await expect(page.locator('text=Total Forms')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('should work completely offline (no external requests)', async ({ page }) => {
    const failedRequests = [];
    const networkRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    page.on('request', request => {
      // Track all network requests except the initial file load
      if (!request.url().startsWith('file://')) {
        networkRequests.push(request.url());
      }
    });
    
    // Load the page
    await page.goto(`file://${singleHtmlPath}`);
    await page.waitForLoadState('networkidle');
    
    // Verify no external network requests were made
    expect(networkRequests).toHaveLength(0);
    
    // Verify application functionality works
    await expect(page.locator('h1')).toContainText('Form Management System');
    
    // Test creating a template (should work offline)
    await page.click('text=New Template');
    await expect(page.locator('h1')).toContainText('Form Builder');
    
    await page.fill('input[placeholder="Enter form name"]', 'Offline Test Form');
    await page.click('text=Add Section');
    await page.fill('input[placeholder="Section name"]', 'Test Section');
    await page.click('text=Add Field');
    await page.fill('input[placeholder="Field label"]', 'Test Field');
    
    // Save should work without any network requests
    await page.click('text=Save Template');
    await expect(page.locator('text=Template saved successfully!')).toBeVisible();
    
    // Verify still no network requests
    expect(networkRequests).toHaveLength(0);
  });

  test('should have all assets inlined (no external dependencies)', async ({ page }) => {
    // Load the page and check for any missing resources
    const resourceErrors = [];
    
    page.on('pageerror', error => {
      resourceErrors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        resourceErrors.push(msg.text());
      }
    });
    
    await page.goto(`file://${singleHtmlPath}`);
    await page.waitForLoadState('networkidle');
    
    // Should have no resource loading errors
    const relevantErrors = resourceErrors.filter(error => 
      error.includes('Failed to load') || 
      error.includes('404') || 
      error.includes('net::ERR_') ||
      error.includes('stylesheet') ||
      error.includes('.css') ||
      error.includes('.js')
    );
    
    expect(relevantErrors).toHaveLength(0);
    
    // Verify UI is properly styled (Tailwind CSS should be inlined)
    const headerElement = page.locator('h1');
    await expect(headerElement).toBeVisible();
    
    // Check that styles are applied
    const headerStyles = await headerElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color
      };
    });
    
    // Should have proper styling from Tailwind CSS
    expect(headerStyles.fontWeight).toBe('700'); // font-bold
    expect(parseFloat(headerStyles.fontSize)).toBeGreaterThan(20); // text-2xl
  });

  test('should maintain all functionality in single file', async ({ page }) => {
    await page.goto(`file://${singleHtmlPath}`);
    
    // Test complete form creation workflow
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Single File Test');
    
    // Add multiple field types
    await page.click('text=Add Section');
    await page.fill('input[placeholder="Section name"]', 'Test Section');
    
    // Add text field
    await page.click('text=Add Field');
    await page.fill('input[placeholder="Field label"]', 'Name');
    
    // Add select field
    await page.click('text=Add Field');
    await page.locator('input[placeholder="Field label"]').nth(1).fill('Category');
    await page.locator('select').nth(1).selectOption('select');
    await page.locator('textarea').fill('Option 1\nOption 2\nOption 3');
    
    // Save template
    await page.click('text=Save Template');
    await expect(page.locator('text=Template saved successfully!')).toBeVisible();
    
    // Test form filling
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Name"]', 'Test User');
    await page.selectOption('select', 'Option 2');
    
    // Submit form
    await page.click('text=Submit Form');
    await expect(page.locator('text=Form submitted successfully!')).toBeVisible();
    
    // Verify data persistence works
    await page.reload();
    await expect(page.locator('text=Single File Test')).toBeVisible();
  });

  test('should have correct file size within PRD limits', async ({ page }) => {
    const fs = require('fs');
    const stats = fs.statSync(singleHtmlPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    // Should be well under the 5MB limit specified in PRD
    expect(fileSizeInMB).toBeLessThan(5);
    
    // Should be reasonably sized (not too bloated)
    expect(fileSizeInMB).toBeLessThan(1); // Should be under 1MB for this app
    
    console.log(`Single HTML file size: ${(fileSizeInMB * 1024).toFixed(2)}KB`);
  });

  test('should work in different browsers', async ({ page, browserName }) => {
    await page.goto(`file://${singleHtmlPath}`);
    
    // Basic functionality should work across all browsers
    await expect(page.locator('h1')).toContainText('Form Management System');
    
    // Test form creation works in all browsers
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', `Browser Test ${browserName}`);
    await page.click('text=Add Section');
    await page.click('text=Add Field');
    await page.click('text=Save Template');
    
    await expect(page.locator('text=Template saved successfully!')).toBeVisible();
    
    console.log(`Single HTML file works correctly in ${browserName}`);
  });

  test('should handle storage limitations gracefully', async ({ page }) => {
    await page.goto(`file://${singleHtmlPath}`);
    
    // Test that the application handles localStorage properly
    const storageTest = await page.evaluate(() => {
      try {
        // Test localStorage availability
        const testKey = 'test_storage';
        localStorage.setItem(testKey, 'test_value');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        return {
          available: true,
          canWrite: retrieved === 'test_value'
        };
      } catch (error) {
        return {
          available: false,
          error: error.message
        };
      }
    });
    
    expect(storageTest.available).toBe(true);
    expect(storageTest.canWrite).toBe(true);
    
    // Verify the app can save data
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Storage Test');
    await page.click('text=Add Section');
    await page.click('text=Add Field');
    await page.click('text=Save Template');
    
    // Data should persist across page reloads
    await page.reload();
    await expect(page.locator('text=Storage Test')).toBeVisible();
  });
});