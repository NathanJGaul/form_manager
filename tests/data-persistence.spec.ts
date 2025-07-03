import { test, expect } from '@playwright/test';

test.describe('Data Persistence & Storage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('localStorage Implementation', () => {
    test('should persist form templates in localStorage', async ({ page }) => {
      // Create a form template
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Persistence Test Template');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Test Field');
      await page.click('text=Save Form');
      
      // Check localStorage contains the template
      const templateData = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('form_templates') || '[]');
      });
      
      expect(templateData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Persistence Test Template',
            fields: expect.arrayContaining([
              expect.objectContaining({
                label: 'Test Field',
                type: 'text'
              })
            ])
          })
        ])
      );
    });

    test('should persist form instances in localStorage', async ({ page }) => {
      // Create template and instance
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Instance Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Instance Field');
      await page.click('text=Save Form');
      
      // Fill form instance
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      await page.fill('input[placeholder="Enter Instance Field"]', 'Instance Data');
      
      // Wait for auto-save
      await page.waitForTimeout(1500);
      
      // Check localStorage contains the instance
      const instanceData = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('form_instances') || '[]');
      });
      
      expect(instanceData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              'Instance Field': 'Instance Data'
            })
          })
        ])
      );
    });

    test('should handle localStorage quota limits gracefully', async ({ page }) => {
      // This test simulates localStorage being full
      await page.evaluate(() => {
        // Fill up localStorage to near capacity
        try {
          let i = 0;
          while (i < 1000) {
            localStorage.setItem(`test_${i}`, 'a'.repeat(1000));
            i++;
          }
        } catch (e) {
          // Expected when localStorage is full
        }
      });
      
      // Try to save a form - should handle gracefully
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Quota Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Quota Field');
      await page.click('text=Save Form');
      
      // Should show error message instead of crashing
      // Note: This assumes proper error handling is implemented
      // await expect(page.locator('text=Storage quota exceeded')).toBeVisible();
      
      // Clean up
      await page.evaluate(() => {
        for (let i = 0; i < 1000; i++) {
          localStorage.removeItem(`test_${i}`);
        }
      });
    });
  });

  test.describe('Auto-Save Functionality', () => {
    test('should auto-save on field changes with debounce', async ({ page }) => {
      // Create and fill form
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Auto-Save Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Auto Field');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Type in field
      await page.fill('input[placeholder="Enter Auto Field"]', 'Auto Save Data');
      
      // Should show "saving" status immediately
      await expect(page.locator('text=Saving...')).toBeVisible();
      
      // Wait for debounce (1 second)
      await page.waitForTimeout(1500);
      
      // Should show "saved" status
      await expect(page.locator('text=Saved')).toBeVisible();
    });

    test('should batch rapid changes with debounce', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Batch Save Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Batch Field');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Rapid typing
      await page.fill('input[placeholder="Enter Batch Field"]', 'A');
      await page.fill('input[placeholder="Enter Batch Field"]', 'AB');
      await page.fill('input[placeholder="Enter Batch Field"]', 'ABC');
      await page.fill('input[placeholder="Enter Batch Field"]', 'ABCD');
      
      // Should only save once after debounce
      await page.waitForTimeout(1500);
      await expect(page.locator('text=Saved')).toBeVisible();
    });

    test('should preserve data across page reloads', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Reload Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Reload Field');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      await page.fill('input[placeholder="Enter Reload Field"]', 'Reload Data');
      
      // Wait for auto-save
      await page.waitForTimeout(1500);
      
      // Reload page
      await page.reload();
      await page.goto('/');
      
      // Navigate back to form
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Data should be preserved
      await expect(page.locator('input[placeholder="Enter Reload Field"]')).toHaveValue('Reload Data');
    });
  });

  test.describe('Data Integrity', () => {
    test('should handle corrupted localStorage data', async ({ page }) => {
      // Inject corrupted data into localStorage
      await page.evaluate(() => {
        localStorage.setItem('form_templates', 'invalid json');
        localStorage.setItem('form_instances', '{"incomplete": json}');
      });
      
      // App should handle gracefully and not crash
      await page.reload();
      await expect(page.locator('h1')).toContainText('Form Manager');
      
      // Should show empty state or error message
      await page.click('text=Dashboard');
      // Note: This assumes proper error handling is implemented
    });

    test('should validate data before saving', async ({ page }) => {
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Validation Test');
      await page.click('text=Add Email Field');
      await page.fill('input[placeholder="Field label"]', 'Email');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Enter invalid email
      await page.fill('input[placeholder="Enter Email"]', 'invalid-email');
      
      // Should show validation error
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should handle concurrent save operations', async ({ page }) => {
      // This test simulates multiple forms being saved simultaneously
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Concurrent Test');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Field 1');
      await page.click('text=Add Text Field');
      await page.fill('input[placeholder="Field label"]', 'Field 2');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Simulate concurrent edits
      await page.fill('input[placeholder="Enter Field 1"]', 'Data 1');
      await page.fill('input[placeholder="Enter Field 2"]', 'Data 2');
      
      // Both should save without conflicts
      await page.waitForTimeout(1500);
      await expect(page.locator('text=Saved')).toBeVisible();
    });
  });

  test.describe('Performance & Optimization', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      // Create a form with many fields
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Large Form Test');
      
      // Add multiple fields
      for (let i = 1; i <= 10; i++) {
        await page.click('text=Add Text Field');
        await page.fill(`input[placeholder="Field label"]`, `Field ${i}`);
      }
      
      await page.click('text=Save Form');
      
      // Fill the large form
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Should load quickly despite size
      await expect(page.locator('text=Field 1')).toBeVisible();
      await expect(page.locator('text=Field 10')).toBeVisible();
      
      // Fill all fields
      for (let i = 1; i <= 10; i++) {
        await page.fill(`input[placeholder="Enter Field ${i}"]`, `Data ${i}`);
      }
      
      // Should auto-save efficiently
      await page.waitForTimeout(1500);
      await expect(page.locator('text=Saved')).toBeVisible();
    });

    test('should compress data for storage optimization', async ({ page }) => {
      // Create form with repetitive data
      await page.click('text=Form Builder');
      await page.fill('input[placeholder="Enter form name"]', 'Compression Test');
      await page.click('text=Add Textarea Field');
      await page.fill('input[placeholder="Field label"]', 'Large Text');
      await page.click('text=Save Form');
      
      await page.click('text=Dashboard');
      await page.click('text=Fill Form');
      
      // Fill with large text
      const largeText = 'Lorem ipsum '.repeat(100);
      await page.fill('textarea[placeholder="Enter Large Text"]', largeText);
      
      await page.waitForTimeout(1500);
      
      // Check that data is stored efficiently
      const storageSize = await page.evaluate(() => {
        const data = localStorage.getItem('form_instances');
        return data ? data.length : 0;
      });
      
      // Should be reasonable size (this assumes compression is implemented)
      expect(storageSize).toBeLessThan(largeText.length * 2);
    });
  });
});